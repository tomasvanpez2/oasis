import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateOrderStatus } from '@/lib/blob'
import { sendOrderNotification } from '@/lib/telegram'
import type { WompiWebhookEvent, OrderStatus } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Validates the cryptographic event signature from Wompi using Node.js crypto module.
 * Wompi algorithm:
 * 1. Extract values referenced by signature.properties in strict order from event.data
 * 2. Concatenate the property values + event.timestamp + secret events key
 * 3. Generate SHA-256 hash of the resulting string
 * 4. Compare with signature.checksum
 */
function verifyWompiSignature(
  event: WompiWebhookEvent,
  eventsSecret: string
): { isValid: boolean; calculatedChecksum: string; receivedChecksum: string } {
  const { properties, checksum } = event.signature
  const timestamp = event.timestamp

  // Extract nested values from event.data based on dot-notated property paths
  const extractedValues = properties.map((propPath) => {
    const keys = propPath.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = event.data

    for (const key of keys) {
      if (key === 'data') continue
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        current = undefined
        break
      }
    }

    return current !== undefined && current !== null ? String(current) : ''
  })

  // Concatenate: values + timestamp + events_secret
  const stringToSign = `${extractedValues.join('')}${timestamp}${eventsSecret}`

  // Compute SHA-256 using Node.js crypto
  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(stringToSign, 'utf8')
    .digest('hex')

  const isValid =
    calculatedChecksum.toLowerCase() === (checksum || '').toLowerCase()

  return { isValid, calculatedChecksum, receivedChecksum: checksum || '' }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const event = rawBody as WompiWebhookEvent

    // ── 1. Structural payload validation ──────────────────────────────────────────
    if (
      !event ||
      !event.signature ||
      !Array.isArray(event.signature.properties) ||
      !event.signature.checksum ||
      !event.timestamp ||
      !event.data ||
      !event.data.transaction
    ) {
      console.warn('[wompi-webhook] Malformed payload received:', rawBody)
      return NextResponse.json(
        { error: 'Estructura de payload de webhook inválida' },
        { status: 400 }
      )
    }

    const { transaction } = event.data
    const { reference, id: transactionId, status, payment_method_type } = transaction

    // ── 2. Cryptographic signature validation ────────────────────────────────
    const configuredSecret =
      process.env.WOMPI_EVENTS_KEY ||
      process.env.WOMPI_INTEGRITY_KEY ||
      'test_events_secret'

    const { isValid, calculatedChecksum, receivedChecksum } = verifyWompiSignature(
      event,
      configuredSecret
    )

    // Allow simulated signature bypass ONLY in non-production local development if header is provided
    const isLocalDev = process.env.NODE_ENV !== 'production'
    const isLocalBypass =
      isLocalDev &&
      (req.headers.get('x-wompi-dev-mode') === 'true' ||
        configuredSecret === 'test_events_secret' ||
        configuredSecret.startsWith('your_'))

    if (!isValid && !isLocalBypass) {
      console.error('[wompi-webhook] CRITICAL: Invalid signature checksum verification failed.', {
        expected: calculatedChecksum,
        received: receivedChecksum,
        reference,
        transactionId,
      })
      return NextResponse.json(
        {
          error: 'Firma criptográfica inválida (Signature mismatch)',
          expected: isLocalDev ? calculatedChecksum : undefined,
        },
        { status: 401 }
      )
    }

    if (!isValid && isLocalBypass) {
      console.info(
        '[wompi-webhook:local] Running in local simulation mode. Cryptographic test signature accepted for dev.'
      )
    }

    // ── 3. Map Wompi transaction status ──────────────────────────────────────────
    const statusMap: Record<string, OrderStatus> = {
      APPROVED: 'approved',
      DECLINED: 'declined',
      VOIDED: 'voided',
      ERROR: 'error',
      PENDING: 'pending',
    }

    const mappedStatus: OrderStatus = statusMap[status] ?? 'pending'

    // ── 4. Update order in Vercel Blob / Local DB ────────────────────────────────
    const updatedOrder = await updateOrderStatus(reference, mappedStatus, transactionId, {
      wompiStatus: status,
      paymentMethodType: payment_method_type,
      amountInCents: transaction.amount_in_cents,
      currency: transaction.currency,
      finalizedAt: transaction.finalized_at || new Date().toISOString(),
      verifiedWithCrypto: isValid,
    })

    if (!updatedOrder) {
      console.warn(`[wompi-webhook] No matching order found for reference: ${reference}`)
      // Return 200 to acknowledge Wompi receipt and prevent endless webhook retries
      return NextResponse.json({
        received: true,
        reference,
        warning: 'Order reference not found in persistent store',
      })
    }

    // ── 5. Trigger Telegram Factory Notification ───────────────────────────────
    // Notify the factory upon final status confirmation (Approved or Declined)
    if (['approved', 'declined', 'voided', 'error'].includes(mappedStatus)) {
      try {
        await sendOrderNotification({
          ...updatedOrder,
          wompiPaymentMethod: payment_method_type,
        })
      } catch (telegramErr) {
        console.error('[wompi-webhook] Telegram dispatch failed non-blockingly:', telegramErr)
      }
    }

    return NextResponse.json({
      received: true,
      reference,
      status: mappedStatus,
      transactionId,
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[wompi-webhook] Internal processing exception:', error)
    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : 'Internal webhook error',
      },
      { status: 500 }
    )
  }
}
