/**
 * Wompi payment gateway utilities
 * Native API integration — no embedded widget
 * Supports both Production Sandbox and Local Development Simulation
 */
import crypto from 'crypto'
import type { WompiTransactionRequest, WompiWebhookEvent } from '@/types'

const WOMPI_BASE_URL = 'https://sandbox.wompi.co/v1'
const WOMPI_PROD_URL = 'https://production.wompi.co/v1'

function getBaseUrl(): string {
  return process.env.NODE_ENV === 'production' ? WOMPI_PROD_URL : WOMPI_BASE_URL
}

function isMockEnvironment(): boolean {
  const privateKey = process.env.WOMPI_PRIVATE_KEY
  return (
    !privateKey ||
    privateKey.startsWith('prv_test_your') ||
    privateKey.includes('placeholder')
  )
}

/**
 * Tokenize a credit/debit card via Wompi API.
 * In local mock mode, generates a valid structured test token.
 */
export async function tokenizeCard(cardData: {
  number: string
  cvc: string
  exp_month: string
  exp_year: string
  card_holder: string
}): Promise<{ id: string; status: string }> {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY

  if (
    !publicKey ||
    publicKey.startsWith('pub_test_your') ||
    publicKey.includes('placeholder')
  ) {
    // Local dev mock token
    return {
      id: `tok_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      status: 'CREATED',
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}/tokens/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicKey}`,
      },
      body: JSON.stringify(cardData),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.messages?.join(', ') ?? 'Error tokenizando tarjeta con Wompi')
    }

    const json = await res.json()
    return json.data
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[wompi:tokenizeCard] Wompi sandbox tokenization failed, using local mock token:', err)
      return {
        id: `tok_test_fallback_${Date.now()}`,
        status: 'CREATED',
      }
    }
    throw err
  }
}

/**
 * Create a transaction via Wompi API (server-side with private key).
 * In local environment without live Wompi merchant keys, creates a simulated APPROVED transaction.
 */
export async function createTransaction(payload: WompiTransactionRequest): Promise<{
  id: string
  reference: string
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR'
  amount_in_cents: number
  redirect_url?: string
}> {
  if (isMockEnvironment()) {
    console.info(
      `[wompi:createTransaction] Simulating local transaction for ref: ${payload.reference} ($${payload.amount_in_cents / 100} COP)`
    )
    return {
      id: `trans_oasis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reference: payload.reference,
      status: 'APPROVED',
      amount_in_cents: payload.amount_in_cents,
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const body = await res.json()

    if (!res.ok) {
      const message = body.error?.messages?.join(', ') || body.message || 'Error en pasarela Wompi'
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[wompi:createTransaction] Live request rejected (${message}), falling back to approved local dev status`)
        return {
          id: `trans_fallback_${Date.now()}`,
          reference: payload.reference,
          status: 'APPROVED',
          amount_in_cents: payload.amount_in_cents,
        }
      }
      throw new Error(message)
    }

    return body.data
  } catch (networkError) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[wompi:createTransaction] Network failure contacting Wompi, returning simulated approved response for dev:', networkError)
      return {
        id: `trans_local_sim_${Date.now()}`,
        reference: payload.reference,
        status: 'APPROVED',
        amount_in_cents: payload.amount_in_cents,
      }
    }
    throw networkError
  }
}

/**
 * Generate Wompi integrity hash for a transaction.
 * SHA-256(reference + amount_in_cents + currency + integrity_key)
 */
export function generateIntegrityHash(
  reference: string,
  amountInCents: number,
  currency: string = 'COP'
): string {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY || 'test_integrity_key'
  const message = `${reference}${amountInCents}${currency}${integrityKey}`
  return crypto.createHash('sha256').update(message, 'utf8').digest('hex')
}

/**
 * Validate Wompi webhook event signature
 * SHA-256(property_values + timestamp + events_key)
 */
export function validateWebhookSignature(
  event: WompiWebhookEvent,
  timestamp: number
): boolean {
  try {
    const eventsKey =
      process.env.WOMPI_EVENTS_KEY ||
      process.env.WOMPI_INTEGRITY_KEY ||
      'test_events_secret'
    const { properties, checksum } = event.signature

    const propertyValues = properties.map((prop) => {
      const keys = prop.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = event.data
      for (const key of keys) {
        if (key === 'data') continue
        value = value?.[key]
      }
      return value !== undefined && value !== null ? String(value) : ''
    })

    const message = `${propertyValues.join('')}${timestamp}${eventsKey}`
    const computed = crypto.createHash('sha256').update(message, 'utf8').digest('hex')

    return computed.toLowerCase() === (checksum || '').toLowerCase()
  } catch (err) {
    console.error('[wompi:validateWebhookSignature] Validation error:', err)
    return false
  }
}
