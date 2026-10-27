/**
 * Wompi Asynchronous Payment Webhook Endpoint
 * Bank-grade signature validation with WOMPI_EVENTS_SECRET.
 * Persists status updates to Vercel Blob DB and notifies the factory via Telegram.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/wompi'
import { updateOrderStatus } from '@/lib/blob'
import { sendOrderNotification } from '@/lib/telegram'
import type { WompiWebhookEvent, OrderStatus } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, OrderStatus> = {
  APPROVED: 'approved',
  DECLINED: 'declined',
  VOIDED: 'voided',
  ERROR: 'error',
  PENDING: 'pending',
}

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch (parseError) {
      console.error('[wompi-webhook:error] Failed to parse request JSON:', parseError)
      return NextResponse.json({ error: 'Cuerpo de solicitud JSON inválido' }, { status: 400 })
    }

    const event = rawBody as WompiWebhookEvent

    // ── 1. Structural Payload Validation ─────────────────────────────────────────
    if (
      !event ||
      typeof event !== 'object' ||
      !event.event ||
      !event.data ||
      !event.data.transaction ||
      !event.signature ||
      !Array.isArray(event.signature.properties) ||
      !event.signature.checksum ||
      typeof event.timestamp !== 'number'
    ) {
      console.warn('[wompi-webhook:warn] Structural validation failed. Malformed payload received:', rawBody)
      return NextResponse.json(
        { error: 'Estructura de payload de webhook inválida' },
        { status: 400 }
      )
    }

    const { transaction } = event.data
    const { reference, id: transactionId, status, payment_method_type, amount_in_cents, currency } = transaction

    // ── 2. Cryptographic Event Signature Verification ───────────────────────────
    const verification = verifyWebhookSignature(event)

    if (!verification.isValid) {
      console.error('[wompi-webhook:CRITICAL] Webhook cryptographic signature mismatch rejected (HTTP 401).', {
        reference,
        transactionId,
        receivedChecksum: verification.receivedChecksum,
        calculatedChecksum: verification.calculatedChecksum,
        error: verification.error,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      })

      return NextResponse.json(
        {
          error: 'Firma criptográfica inválida (Signature mismatch)',
          details: 'Event secret validation failed. Request rejected.',
        },
        { status: 401 }
      )
    }

    // ── 3. Transaction Status Resolution ────────────────────────────────────────
    const normalizedStatus = (status || '').toUpperCase()
    const mappedStatus: OrderStatus = STATUS_MAP[normalizedStatus] ?? 'pending'

    console.info(
      `[wompi-webhook:authenticated] Event valid for order ${reference}. Status: ${normalizedStatus} -> ${mappedStatus}. Tx ID: ${transactionId}`
    )

    // ── 4. Atomic Database Update (Vercel Blob) ─────────────────────────────────
    const updatedOrder = await updateOrderStatus(reference, mappedStatus, transactionId, {
      wompiStatus: normalizedStatus,
      paymentMethodType: payment_method_type,
      amountInCents: amount_in_cents,
      currency: currency || 'COP',
      finalizedAt: transaction.finalized_at || new Date().toISOString(),
      verifiedWithSignature: true,
      wompiEnvironment: event.environment,
    })

    if (!updatedOrder) {
      console.warn(`[wompi-webhook:warning] Order with reference ${reference} not found in database.`)
      // Return 200 to acknowledge Wompi receipt and prevent endless webhook retries
      return NextResponse.json(
        {
          received: true,
          reference,
          status: mappedStatus,
          warning: 'Referencia no encontrada en la base de datos',
        },
        { status: 200 }
      )
    }

    // ── 5. Automated Factory Dispatch (Telegram) ────────────────────────────────
    // Send Telegram notification detailing the order, amount, and BI category
    if (['approved', 'declined', 'voided', 'error'].includes(mappedStatus)) {
      try {
        await sendOrderNotification({
          ...updatedOrder,
          wompiPaymentMethod: payment_method_type,
        })
      } catch (telegramErr) {
        console.error('[wompi-webhook:telegram] Non-blocking dispatch failure:', telegramErr)
      }
    }

    return NextResponse.json(
      {
        received: true,
        reference,
        status: mappedStatus,
        transactionId,
        biCategory: updatedOrder.biCategory,
        verifiedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[wompi-webhook:fatal] Unhandled server exception processing webhook:', error)
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : 'Error interno procesando webhook',
      },
      { status: 500 }
    )
  }
}
