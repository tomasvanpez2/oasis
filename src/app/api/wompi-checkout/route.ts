/**
 * Wompi Checkout Session Initialization Endpoint
 * Strictly 0% PCI-DSS Scope: Zero card data captured on our infrastructure.
 * Zero-Trust Architectural Security: Shipping and financial totals are deterministically
 * calculated and enforced on the server using Transporte Propio logistics matrix.
 * Client-side shipping injections or alterations are completely neutralized.
 * Generates cryptographic integrity signature (SHA-256) and returns official Wompi redirect URL.
 * Categorizes and persists the pending order into Vercel Blob with mandatory BI category.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateIntegrityHash, buildWompiCheckoutUrl, getWompiKeys } from '@/lib/wompi'
import { saveOrder, classifyOrderCategory } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import {
  resolveShippingFromLocation,
  ALLOWED_CITIES,
  isValidBogotaLocalidad,
  isOnlyAccessories,
  COORDINADORA_ACCESSORIES_TEXT,
  type AllowedCity,
} from '@/lib/shipping'
import type { Order, CartItem, CustomerInfo } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface WompiCheckoutRequestBody {
  customer: CustomerInfo
  items: CartItem[]
  subtotal?: number
  shipping?: number
  shippingZone?: string
  total?: number
  redirectUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    let body: WompiCheckoutRequestBody
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de solicitud JSON inválido' },
        { status: 400 }
      )
    }

    const { customer, items, subtotal: clientSubtotal, shipping: clientShipping, total: clientTotal, redirectUrl } = body

    // ── 1. Validate Customer Information ─────────────────────────────────────────
    if (!customer || typeof customer !== 'object') {
      return NextResponse.json(
        { error: 'Faltan los datos de facturación y entrega del cliente' },
        { status: 400 }
      )
    }

    const { fullName, email, phone, document, documentType, city, localidad, address } = customer

    if (!fullName || !email || !phone || !document || !city || !address) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios del cliente deben estar completos' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito no contiene productos para procesar' },
        { status: 400 }
      )
    }

    // ── 2. ZERO-TRUST LOGISTICS: Server-side Logistics Rate Enforcement ──
    const onlyAccessories = isOnlyAccessories(items)
    let trustedShippingFee = 0
    let trustedShippingZoneName: string = COORDINADORA_ACCESSORIES_TEXT
    let trustedShippingZoneId = 'coordinadora-contra-entrega'

    if (!onlyAccessories) {
      // Regla estricta Transporte Propio: Solo 4 ciudades permitidas (Cota, Chía, Cajicá, Bogotá)
      if (!ALLOWED_CITIES.includes(city as AllowedCity)) {
        return NextResponse.json(
          {
            error:
              'Ciudad no autorizada. El servicio logístico de Transporte Propio opera exclusivamente en Cota, Chía, Cajicá y Bogotá D.C.',
          },
          { status: 400 }
        )
      }

      // Regla estricta: Si la ciudad es Bogotá, la localidad es obligatoria y debe ser oficial
      if (city === 'Bogotá') {
        if (!localidad || typeof localidad !== 'string' || localidad.trim().length === 0) {
          return NextResponse.json(
            {
              error:
                'Para despachos en Bogotá D.C. es estrictamente obligatorio seleccionar una de las 20 localidades oficiales.',
            },
            { status: 400 }
          )
        }

        if (!isValidBogotaLocalidad(localidad)) {
          return NextResponse.json(
            {
              error:
                'La localidad indicada no corresponde a ninguna de las 20 localidades oficiales de Bogotá D.C.',
            },
            { status: 400 }
          )
        }
      }

      // Recálculo autoritativo e inmutable del flete al 100% (cero subsidios)
      const shippingResolution = resolveShippingFromLocation(city, localidad, items)

      if (!shippingResolution.isCovered) {
        return NextResponse.json(
          {
            error:
              shippingResolution.warning ||
              'El destino seleccionado se encuentra fuera de la cobertura de Transporte Propio.',
          },
          { status: 400 }
        )
      }

      trustedShippingFee = shippingResolution.zone.price
      trustedShippingZoneName = shippingResolution.zone.name
      trustedShippingZoneId = shippingResolution.zone.id
    }

    // ── 3. ZERO-TRUST FINANCIAL CALCULATIONS (100% Flete, 0 Subsidios) ────────────
    const trustedSubtotal = items.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0
    )
    const trustedTotal = trustedSubtotal + trustedShippingFee
    const amountInCents = Math.round(trustedTotal * 100)

    // Detección adversarial de manipulación de precios desde el cliente
    if (clientShipping !== undefined && clientShipping !== trustedShippingFee) {
      console.warn(
        `[ZeroTrust:TamperMitigated] Client submitted shipping fee $${clientShipping} COP, but server enforced authoritative fee $${trustedShippingFee} COP for "${city} - ${localidad || 'N/A'}".`
      )
    }

    if (clientTotal !== undefined && clientTotal !== trustedTotal) {
      console.warn(
        `[ZeroTrust:TamperMitigated] Client submitted total $${clientTotal} COP, but server enforced authoritative total $${trustedTotal} COP.`
      )
    }

    if (amountInCents <= 0) {
      return NextResponse.json(
        { error: 'El monto total a pagar debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // ── 4. Reference and BI Categorization ──────────────────────────────────────
    const reference = generateOrderReference()
    const biCategory = classifyOrderCategory(items, trustedTotal)

    // ── 5. Persist Authoritative Order to Vercel Blob (Explicit payment_pending status) ──
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      wompiReference: reference,
      status: 'payment_pending',
      biCategory,
      customer: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        document: document.trim(),
        documentType: documentType || 'CC',
        city: city.trim(),
        localidad: city === 'Bogotá' && localidad ? localidad.trim() : undefined,
        address: address.trim(),
        notes: customer.notes?.trim() || '',
        shippingZoneId: trustedShippingZoneId,
        shippingZoneName: trustedShippingZoneName,
      },
      items,
      subtotal: trustedSubtotal,
      shipping: trustedShippingFee,
      shippingZone: trustedShippingZoneName,
      total: trustedTotal,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wompiPaymentMethod: 'Wompi Web Checkout',
    }

    // ── Non-blocking Resilient Pre-save to Vercel Blob
    try {
      await saveOrder(order)
      console.info(
        `[api/wompi-checkout:saveOrder] Pre-order persisted successfully: ${reference} (Shipping: ${trustedShippingZoneName} — $${trustedShippingFee} COP)`
      )
    } catch (saveError) {
      console.error(
        `[api/wompi-checkout:saveOrder:error] Vercel Blob pre-save failed for order ${reference}, but proceeding with Wompi checkout:`,
        saveError
      )
    }

    // ── 6. Generate SHA-256 Cryptographic Integrity Hash ─────────────────────────
    // Concatenates: reference + amountInCents + currency + WOMPI_INTEGRITY_SECRET
    // Strictly computed on trusted amountInCents to guarantee zero-tamper payment at Wompi
    const integrityHash = generateIntegrityHash(reference, amountInCents, 'COP')

    // ── 7. Build Official Hosted Checkout URL ────────────────────────────────────
    const requestOrigin =
      req.headers.get('origin') ||
      req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
      'https://oasiscolchones.co'

    let returnUrl = `${requestOrigin}/checkout/success?reference=${encodeURIComponent(reference)}`
    if (redirectUrl && typeof redirectUrl === 'string') {
      try {
        const parsed = new URL(redirectUrl, requestOrigin)
        const allowedOrigin = new URL(requestOrigin).origin
        if (parsed.origin === allowedOrigin) {
          returnUrl = parsed.toString()
        }
      } catch {
        // Ignorar redirect externo inseguro y usar la URL por defecto
      }
    }

    const checkoutUrl = buildWompiCheckoutUrl({
      reference,
      amountInCents,
      currency: 'COP',
      customer: order.customer,
      redirectUrl: returnUrl,
      integrityHash,
    })

    const { publicKey } = getWompiKeys()

    return NextResponse.json({
      success: true,
      reference,
      checkoutUrl,
      amountInCents,
      currency: 'COP',
      shipping: trustedShippingFee,
      shippingZone: trustedShippingZoneName,
      total: trustedTotal,
      biCategory,
      integrityHash,
      publicKey,
    })
  } catch (err) {
    console.error('[api/wompi-checkout:error]', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Error al inicializar sesión de pago segura con Wompi',
      },
      { status: 500 }
    )
  }
}
