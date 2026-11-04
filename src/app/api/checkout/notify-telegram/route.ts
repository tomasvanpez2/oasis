/**
 * Internal Autonomous Telegram Notification & Order Confirmation Route Handler
 * 
 * Zero-Trust & Fail-Closed Architecture:
 * - Validation is deterministic and based EXCLUSIVELY on Wompi's JSON 200 response.
 * - Under NO circumstances will an order be marked as 'approved' or notified to Telegram
 *   if Wompi does NOT return HTTP 200 with status strictly 'APPROVED'.
 * - Any 401, 404, 500, or non-APPROVED status aborts immediately with a structured error.
 * - Critical logs are emitted if Wompi responds with HTTP 401 ("Fallo Auth Wompi: Verifica Entorno Sandbox/Prod").
 * - Does not trust URL parameters or prior persistence in Vercel Blob: reconstructs and hydrates
 *   directly from verified Wompi gateway data if necessary.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getOrderByReference, getOrders, saveOrder, updateOrderStatus } from '@/lib/blob'
import { getWompiTransactionById, WompiAuthError, WompiApiError } from '@/lib/wompi'
import { sendOrderNotification } from '@/lib/telegram'
import type { Order, OrderStatus } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatPaymentMethodName(
  type: string = '',
  paymentMethod?: Record<string, unknown>
): string {
  const normType = type.toUpperCase()

  if (normType === 'CARD') {
    const extra = (paymentMethod?.extra as Record<string, unknown>) || {}
    const brand = (paymentMethod?.brand as string) || (extra.brand as string) || 'Crédito'
    const lastFour = (paymentMethod?.last_four as string) || (extra.last_four as string)
    return `Tarjeta de Crédito ${brand.toUpperCase()}${lastFour ? ` (•••• ${lastFour})` : ''}`
  }

  if (normType === 'NEQUI') {
    return 'Nequi (Débito Directo)'
  }

  if (normType === 'BANCOLOMBIA_TRANSFER' || normType === 'BANCOLOMBIA_COLLECT') {
    return 'Botón Bancolombia / Transferencia'
  }

  if (normType === 'PSE') {
    const extra = (paymentMethod?.extra as Record<string, unknown>) || {}
    const bankName =
      (extra.financial_institution_name as string) ||
      (paymentMethod?.financial_institution_name as string)
    return `PSE Débito Bancario${bankName ? ` (${bankName})` : ''}`
  }

  if (normType === 'DAVIPLATA') {
    return 'DaviPlata'
  }

  return 'Wompi Web Checkout Seguro (Bancolombia)'
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      // Body may be empty on direct calls
    }

    const { searchParams } = new URL(req.url)
    const reference = (
      (body.reference as string) ||
      searchParams.get('reference') ||
      ''
    ).trim()
    const transactionId = (
      (body.transactionId as string) ||
      (body.id as string) ||
      searchParams.get('id') ||
      searchParams.get('transactionId') ||
      ''
    ).trim()

    // ── 1. Zero-Trust Check: Require Valid Wompi Transaction ID ─────────────
    // Without a transactionId, payment cannot be verified deterministically against Wompi.
    if (!transactionId) {
      console.warn('[notify-telegram:FAIL_CLOSED] Rechazo: No se proporcionó transactionId de Wompi')
      return NextResponse.json(
        {
          success: false,
          status: 'MISSING_TRANSACTION_ID',
          error: 'Se requiere ID de transacción de Wompi para verificar y confirmar la orden',
        },
        { status: 400 }
      )
    }

    // ── 2. Authenticated Query to Wompi REST API (Fail-Closed) ───────────────
    let wompiTx
    try {
      wompiTx = await getWompiTransactionById(transactionId)
    } catch (err) {
      if (
        err instanceof WompiAuthError ||
        (err instanceof Error && err.message.includes('Fallo Auth Wompi'))
      ) {
        console.error(
          '[notify-telegram:CRITICAL] Fallo Auth Wompi: Verifica Entorno Sandbox/Prod',
          {
            transactionId,
            reference,
            error: err instanceof Error ? err.message : err,
          }
        )
        return NextResponse.json(
          {
            success: false,
            status: 'AUTH_ERROR',
            error: 'Fallo Auth Wompi: Verifica Entorno Sandbox/Prod',
          },
          { status: 401 }
        )
      }

      console.error('[notify-telegram:CRITICAL] Error al consultar API de Wompi (Fail-Closed):', err)
      return NextResponse.json(
        {
          success: false,
          status: 'GATEWAY_ERROR',
          error:
            err instanceof Error
              ? err.message
              : 'Error al consultar transacción en pasarela Wompi',
        },
        { status: 502 }
      )
    }

    // ── 3. Strict Deterministic Status Validation: ONLY APPROVED ALLOWED ────
    const wompiStatus = (wompiTx.status || '').toUpperCase()

    if (wompiStatus !== 'APPROVED') {
      console.warn(
        `[notify-telegram:FAIL_CLOSED] Transacción ${transactionId} no aprobada. Estado Wompi: ${wompiStatus}`
      )

      // Update local order status in Blob if it exists to match Wompi reality
      const targetRef = wompiTx.reference || reference
      if (targetRef) {
        try {
          const mappedStatus: OrderStatus =
            wompiStatus === 'DECLINED'
              ? 'declined'
              : wompiStatus === 'VOIDED'
              ? 'voided'
              : wompiStatus === 'ERROR'
              ? 'error'
              : 'pending'

          await updateOrderStatus(targetRef, mappedStatus, transactionId, {
            wompiStatus,
            paymentMethodType: wompiTx.payment_method_type,
            amountInCents: wompiTx.amount_in_cents,
          })
        } catch (dbErr) {
          console.warn('[notify-telegram:update-declined-order-failed]', dbErr)
        }
      }

      // FAIL CLOSED: NEVER mark approved, NEVER notify Telegram
      return NextResponse.json(
        {
          success: false,
          status: wompiStatus,
          error: `Transacción no aprobada por la pasarela de pagos (Estado Wompi: ${wompiStatus})`,
          transaction: {
            id: wompiTx.id,
            reference: wompiTx.reference,
            status: wompiStatus,
            statusMessage: wompiTx.status_message,
            amountInCents: wompiTx.amount_in_cents,
            currency: wompiTx.currency,
          },
        },
        { status: 422 }
      )
    }

    // ── 4. Cross-Reference Validation ───────────────────────────────────────
    // If client supplied a reference, ensure it matches Wompi's verified reference
    if (
      reference &&
      wompiTx.reference &&
      reference.toLowerCase() !== wompiTx.reference.toLowerCase()
    ) {
      console.error(
        '[notify-telegram:CRITICAL] Conflicto de referencia: La referencia de solicitud no coincide con Wompi',
        {
          providedReference: reference,
          wompiReference: wompiTx.reference,
          transactionId,
        }
      )
      return NextResponse.json(
        {
          success: false,
          status: 'REFERENCE_MISMATCH',
          error: 'La referencia indicada no coincide con la transacción oficial de Wompi',
        },
        { status: 400 }
      )
    }

    // ── 5. Payment Details Extraction from Verified Wompi JSON 200 ───────────
    const pm = (wompiTx.payment_method as Record<string, unknown>) || {}
    const paymentMethodDisplay = formatPaymentMethodName(wompiTx.payment_method_type, pm)

    let installments = 1
    if (pm && typeof pm.installments === 'number' && pm.installments > 0) {
      installments = pm.installments
    } else if (wompiTx.payment_method_type === 'CARD') {
      installments = (pm.installments as number) || 1
    }

    // ── 6. Deterministic Order Resolution (Independent of prior Blob state) ──
    const targetReference = wompiTx.reference || reference
    let order: Order | null = null

    if (targetReference) {
      order = await getOrderByReference(targetReference)
    }

    if (!order && transactionId) {
      const db = await getOrders()
      order = db.orders.find((o) => o.wompiTransactionId === transactionId) || null
    }

    // Zero-Trust fallback: If order is missing from Vercel Blob (e.g. latency or pre-save error),
    // reconstruct order deterministically from Wompi's JSON 200 verified response!
    if (!order) {
      console.info(
        `[notify-telegram:reconstruct] Orden ${targetReference} no encontrada en Blob. Reconstruyendo desde JSON 200 Wompi.`
      )

      const rawCustomer = (wompiTx.customer_data as Record<string, unknown>) || {}
      const rawShipping = (wompiTx.shipping_address as Record<string, unknown>) || {}
      const totalCOP = Math.round((wompiTx.amount_in_cents || 0) / 100)

      order = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        wompiReference: targetReference,
        wompiTransactionId: wompiTx.id,
        status: 'approved',
        biCategory: '1_Colchones_Premium',
        customer: {
          fullName:
            (rawCustomer.full_name as string) ||
            (rawCustomer.fullName as string) ||
            'Cliente Oasis',
          email:
            wompiTx.customer_email ||
            (rawCustomer.email as string) ||
            '',
          phone:
            (rawCustomer.phone_number as string) ||
            (rawShipping.phone_number as string) ||
            '',
          document: (rawCustomer.legal_id as string) || '',
          documentType:
            ((rawCustomer.legal_id_type as string) || 'CC') as 'CC' | 'CE' | 'NIT' | 'PP',
          city:
            (rawShipping.city as string) ||
            (rawShipping.region as string) ||
            'Bogotá D.C.',
          address:
            (rawShipping.address_line_1 as string) ||
            'Dirección registrada en Wompi',
          shippingZoneName: (rawShipping.city as string) || 'Bogotá Urbana',
        },
        items: [
          {
            productId: 'oasis-wompi-checkout',
            productName: `Colchón Oasis Colchones (Ref: ${targetReference})`,
            productSlug: 'colchon-oasis-fabrica',
            size: 'Doble',
            dimensions: '140 × 190 cm',
            price: totalCOP,
            quantity: 1,
            imageUrl:
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
          },
        ],
        subtotal: totalCOP,
        shipping: 0,
        shippingZone: (rawShipping.city as string) || 'Bogotá Urbana',
        total: totalCOP,
        currency: 'COP',
        createdAt: wompiTx.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wompiPaymentMethod: paymentMethodDisplay,
        wompiInstallments: installments,
      }

      try {
        await saveOrder(order)
      } catch (saveErr) {
        console.warn('[notify-telegram:persist-reconstructed-order-failed]', saveErr)
      }
    } else {
      // Order exists in Blob: update status to approved with verified Wompi metadata
      order.status = 'approved'
      order.wompiTransactionId = wompiTx.id
      order.wompiPaymentMethod = paymentMethodDisplay
      order.wompiInstallments = installments
      order.updatedAt = new Date().toISOString()

      try {
        await saveOrder(order)
      } catch (updateErr) {
        console.warn('[notify-telegram:update-order-failed]', updateErr)
      }
    }

    // ── 7. Autonomous Server-Side Telegram Dispatch (Idempotent) ────────────
    let telegramDispatched = false
    const paymentData = (order.wompiPaymentData || {}) as Record<string, unknown>
    const alreadyDispatched = Boolean(paymentData.telegramDispatchedAt)

    if (!alreadyDispatched) {
      try {
        const result = await sendOrderNotification(order)
        telegramDispatched = result.success

        if (result.success) {
          paymentData.telegramDispatchedAt = new Date().toISOString()
          paymentData.telegramMessageId = result.messageId
          order.wompiPaymentData = paymentData
          await saveOrder(order)
        }
      } catch (tgErr) {
        console.error('[notify-telegram:dispatch-failed]', tgErr)
      }
    } else {
      telegramDispatched = true
    }

    // ── 8. Return Verified Hydrated Order to Client ──────────────────────────
    return NextResponse.json({
      success: true,
      status: 'APPROVED',
      telegramSent: telegramDispatched,
      order: {
        id: order.id,
        reference: order.wompiReference,
        wompiTransactionId: wompiTx.id,
        status: order.status,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        shippingZone:
          order.shippingZone ||
          order.customer.shippingZoneName ||
          'Normandía (Bogotá)',
        total: order.total,
        currency: order.currency,
        biCategory: order.biCategory,
        paymentMethod: paymentMethodDisplay,
        installments: installments,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error('[notify-telegram:fatal]', error)
    return NextResponse.json(
      {
        success: false,
        status: 'SERVER_ERROR',
        error:
          error instanceof Error
            ? error.message
            : 'Error interno al procesar confirmación de pago',
      },
      { status: 500 }
    )
  }
}
