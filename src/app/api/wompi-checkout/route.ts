/**
 * Wompi Checkout Session Initialization Endpoint
 * Strictly 0% PCI-DSS Scope: Zero card data captured on our infrastructure.
 * Generates cryptographic integrity signature (SHA-256) and returns official Wompi redirect URL.
 * Categorizes and persists the pending order into Vercel Blob with mandatory BI category.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateIntegrityHash, buildWompiCheckoutUrl, getWompiKeys } from '@/lib/wompi'
import { saveOrder, classifyOrderCategory } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import type { Order, CartItem, CustomerInfo } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WompiCheckoutRequestBody {
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
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

    const { customer, items, subtotal, shipping = 0, shippingZone = '', total, redirectUrl } = body

    // ── 1. Validate Customer Information ─────────────────────────────────────────
    if (!customer || typeof customer !== 'object') {
      return NextResponse.json(
        { error: 'Faltan los datos de facturación y entrega del cliente' },
        { status: 400 }
      )
    }

    const { fullName, email, phone, document, documentType, city, address } = customer

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

    // ── 2. Financial Calculations ────────────────────────────────────────────────
    const calculatedSubtotal = subtotal || items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const calculatedTotal = total || calculatedSubtotal + shipping
    const amountInCents = Math.round(calculatedTotal * 100)

    if (amountInCents <= 0) {
      return NextResponse.json(
        { error: 'El monto total a pagar debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // ── 3. Reference and BI Categorization ──────────────────────────────────────
    const reference = generateOrderReference()
    const biCategory = classifyOrderCategory(items, calculatedTotal)

    // ── 4. Persist Pending Order to Vercel Blob ──────────────────────────────────
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      wompiReference: reference,
      status: 'pending',
      biCategory,
      customer: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        document: document.trim(),
        documentType: documentType || 'CC',
        city: city.trim(),
        address: address.trim(),
        notes: customer.notes?.trim() || '',
      },
      items,
      subtotal: calculatedSubtotal,
      shipping,
      shippingZone: shippingZone || customer.shippingZoneName || '',
      total: calculatedTotal,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wompiPaymentMethod: 'Wompi Web Checkout',
    }

    await saveOrder(order)

    // ── 5. Generate SHA-256 Integrity Hash ───────────────────────────────────────
    // Concatenates: reference + amountInCents + currency + WOMPI_INTEGRITY_SECRET
    const integrityHash = generateIntegrityHash(reference, amountInCents, 'COP')

    // ── 6. Build Official Hosted Checkout URL ────────────────────────────────────
    const requestOrigin =
      req.headers.get('origin') ||
      req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
      'https://oasiscolchones.co'

    const returnUrl = redirectUrl || `${requestOrigin}/checkout/success?reference=${encodeURIComponent(reference)}`

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
      biCategory,
      integrityHash,
      publicKey,
    })
  } catch (err) {
    console.error('[api/wompi-checkout:error]', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Error al inicializar sesión de pago segura con Wompi',
      },
      { status: 500 }
    )
  }
}
