/**
 * Internal Autonomous Telegram Notification & Order Confirmation Route Handler
 * 
 * Strictly autonomous: Dispatched by our own server upon post-payment checkout arrival,
 * completely independent of Wompi webhook reliability or delays.
 * 
 * Flow:
 * 1. Resolves order by reference / transaction ID.
 * 2. Optionally queries Wompi REST API directly to retrieve exact payment method & installments.
 * 3. Formats and sends high-impact production notification to factory Telegram group.
 * 4. Returns complete hydrated order details for the Quiet Luxury post-payment receipt.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getOrderByReference, getOrders, saveOrder } from '@/lib/blob'
import { getWompiTransactionById } from '@/lib/wompi'
import { sendOrderNotification } from '@/lib/telegram'
import type { Order } from '@/types'

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
    const bankName = (extra.financial_institution_name as string) || (paymentMethod?.financial_institution_name as string)
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
    const reference = (body.reference as string) || searchParams.get('reference') || ''
    const transactionId = (body.transactionId as string) || (body.id as string) || searchParams.get('id') || ''

    if (!reference && !transactionId) {
      return NextResponse.json(
        { error: 'Se requiere referencia de orden o ID de transacción' },
        { status: 400 }
      )
    }

    // ── 1. Locate Order in Storage ──────────────────────────────────────────
    let order: Order | null = null

    if (reference) {
      order = await getOrderByReference(reference)
    }

    if (!order && transactionId) {
      const db = await getOrders()
      order = db.orders.find((o) => o.wompiTransactionId === transactionId) || null
    }

    // If still not found by exact match, search by prefix/partial
    if (!order && reference) {
      const db = await getOrders()
      order = db.orders.find((o) => o.wompiReference.toLowerCase() === reference.toLowerCase()) || null
    }

    // ── 2. Reconcile with Wompi REST API if transactionId is available ──────
    let installments = order?.wompiInstallments || 1
    let paymentMethodDisplay = order?.wompiPaymentMethod || 'Wompi Web Checkout Seguro'

    if (transactionId) {
      try {
        const wompiTx = await getWompiTransactionById(transactionId)
        if (wompiTx) {
          const pm = wompiTx.payment_method as Record<string, unknown> | undefined
          paymentMethodDisplay = formatPaymentMethodName(wompiTx.payment_method_type, pm)

          if (pm && typeof pm.installments === 'number' && pm.installments > 0) {
            installments = pm.installments
          } else if (wompiTx.payment_method_type === 'CARD') {
            installments = (pm?.installments as number) || 1
          } else {
            installments = 1
          }

          if (order) {
            order.wompiTransactionId = transactionId
            order.wompiPaymentMethod = paymentMethodDisplay
            order.wompiInstallments = installments
            if (wompiTx.status === 'APPROVED') {
              order.status = 'approved'
            }
          }
        }
      } catch (wompiErr) {
        console.warn('[notify-telegram:wompi-fetch-skipped]', wompiErr instanceof Error ? wompiErr.message : wompiErr)
        // Non-blocking: continue with local order details
      }
    }

    // If order is still not found in DB (e.g., direct test), build a mock order or return error
    if (!order) {
      return NextResponse.json(
        {
          error: 'Orden no encontrada en la base de datos de Oasis Colchones',
          reference,
          transactionId,
        },
        { status: 404 }
      )
    }

    // Ensure status is marked approved upon reaching confirmation
    if (order.status === 'pending') {
      order.status = 'approved'
    }

    order.wompiInstallments = installments
    order.wompiPaymentMethod = paymentMethodDisplay

    // ── 3. Autonomous Server-Side Telegram Dispatch ────────────────────────
    let telegramDispatched = false
    const paymentData = (order.wompiPaymentData || {}) as Record<string, unknown>
    const alreadyDispatched = Boolean(paymentData.telegramDispatchedAt)

    // Send Telegram notification if not previously dispatched, or if forced
    if (!alreadyDispatched) {
      try {
        const result = await sendOrderNotification(order)
        telegramDispatched = result.success

        paymentData.telegramDispatchedAt = new Date().toISOString()
        paymentData.telegramMessageId = result.messageId
        order.wompiPaymentData = paymentData
        await saveOrder(order)
      } catch (tgErr) {
        console.error('[notify-telegram:failed]', tgErr)
      }
    } else {
      telegramDispatched = true
    }

    return NextResponse.json({
      success: true,
      telegramSent: telegramDispatched,
      order: {
        id: order.id,
        reference: order.wompiReference,
        wompiTransactionId: order.wompiTransactionId || transactionId || '',
        status: order.status,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        shippingZone: order.shippingZone || order.customer.shippingZoneName || 'Normandía (Bogotá)',
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
        error: error instanceof Error ? error.message : 'Error interno al procesar confirmación y notificación',
      },
      { status: 500 }
    )
  }
}



