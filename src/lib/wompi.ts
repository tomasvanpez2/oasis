/**
 * Wompi Payment Gateway Integration & Cryptographic Engine
 * Bank-grade security architecture adhering to Wompi Official Developer Specifications.
 *
 * Strict separation of concerns:
 * - 0% PCI-DSS footprint: Zero credit card numbers (PAN), CVVs, or expirations handled on Oasis servers.
 * - Mandatory Integrity Key (WOMPI_INTEGRITY_SECRET) for transaction hashing.
 * - Mandatory Events Key (WOMPI_EVENTS_SECRET) for webhook signature verification.
 * - Timing-safe constant-time hash comparisons (crypto.timingSafeEqual).
 */
import crypto from 'crypto'
import type {
  CustomerInfo,
  WompiCheckoutParams,
  WompiKeysConfig,
  WompiTransaction,
  WompiWebhookEvent,
} from '@/types'

const WOMPI_SANDBOX_API = 'https://sandbox.wompi.co/v1'
const WOMPI_PROD_API = 'https://production.wompi.co/v1'
const WOMPI_CHECKOUT_BASE_URL = 'https://checkout.wompi.co/p/'

/**
 * Resolves the 4 fundamental Wompi cryptographic keys from environment variables.
 * Prioritizes standard enterprise naming with fallbacks for legacy prefixes.
 */
export function getWompiKeys(): WompiKeysConfig {
  const publicKey =
    process.env.WOMPI_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
    ''

  const privateKey =
    process.env.WOMPI_PRIVATE_KEY ||
    ''

  const eventsSecret =
    process.env.WOMPI_EVENTS_SECRET ||
    process.env.WOMPI_EVENTS_KEY ||
    ''

  const integritySecret =
    process.env.WOMPI_INTEGRITY_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    ''

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    publicKey.startsWith('pub_prod_') ||
    privateKey.startsWith('prv_prod_')

  // In production, validate that no dummy or empty keys exist
  if (process.env.NODE_ENV === 'production') {
    const missingKeys: string[] = []
    if (!publicKey || publicKey.includes('placeholder')) missingKeys.push('WOMPI_PUBLIC_KEY')
    if (!privateKey || privateKey.includes('placeholder')) missingKeys.push('WOMPI_PRIVATE_KEY')
    if (!eventsSecret || eventsSecret.includes('placeholder')) missingKeys.push('WOMPI_EVENTS_SECRET')
    if (!integritySecret || integritySecret.includes('placeholder')) missingKeys.push('WOMPI_INTEGRITY_SECRET')

    if (missingKeys.length > 0) {
      console.error(
        `[wompi:security_audit] CRITICAL ERROR: Missing or unconfigured Wompi keys in production environment: ${missingKeys.join(
          ', '
        )}`
      )
    }
  }

  return {
    publicKey,
    privateKey,
    eventsSecret,
    integritySecret,
    isProduction,
  }
}

/**
 * Returns the base API URL depending on the active key type or runtime environment.
 */
export function getWompiApiBaseUrl(): string {
  const { isProduction, publicKey } = getWompiKeys()
  if (isProduction || publicKey.startsWith('pub_prod_')) {
    return WOMPI_PROD_API
  }
  return WOMPI_SANDBOX_API
}

// ─── 1. Integrity Signature Generation ────────────────────────────────────────

/**
 * Generates the SHA-256 integrity hash required by Wompi prior to checkout dispatch.
 * Official Specification:
 * SHA-256(reference + amount_in_cents + currency + integrity_secret)
 *
 * @param reference Unique merchant order reference (e.g. "OC-2026-X8F9")
 * @param amountInCents Amount in Colombian Pesos cents (e.g. 150000000 for $1,500,000 COP)
 * @param currency ISO 4217 currency code (strictly "COP")
 * @param customSecret Optional override for testing or rotation
 * @returns Hexadecimal SHA-256 string in lowercase
 */
export function generateIntegrityHash(
  reference: string,
  amountInCents: number,
  currency: string = 'COP',
  customSecret?: string
): string {
  if (!reference || typeof reference !== 'string') {
    throw new Error('[wompi:integrity] Reference string is mandatory for hash generation')
  }

  if (typeof amountInCents !== 'number' || isNaN(amountInCents) || amountInCents <= 0) {
    throw new Error('[wompi:integrity] Amount in cents must be a positive integer')
  }

  const { integritySecret } = getWompiKeys()
  const secret = customSecret || integritySecret

  if (!secret) {
    const errorMsg =
      '[wompi:integrity] WOMPI_INTEGRITY_SECRET is missing. Cannot generate transaction signature.'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  // Wompi official concatenation order: reference + amountInCents + currency + integritySecret
  const rawString = `${reference}${Math.round(amountInCents)}${currency}${secret}`

  return crypto
    .createHash('sha256')
    .update(rawString, 'utf8')
    .digest('hex')
    .toLowerCase()
}

// ─── 2. Webhook Event Signature Verification ─────────────────────────────────

/**
 * Helper to safely extract deep property path from payload
 */
function extractPropertyFromPayload(payload: unknown, propertyPath: string): string {
  if (!payload || typeof payload !== 'object') return ''

  const keys = propertyPath.split('.')
  // Try resolving from event.data first
  let current: unknown = (payload as Record<string, unknown>).data ?? payload

  for (const key of keys) {
    if (key === 'data') continue
    if (current !== null && current !== undefined && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      current = undefined
      break
    }
  }

  // Fallback: try resolving from top-level payload if not found in data
  if (current === undefined) {
    current = payload
    for (const key of keys) {
      if (current !== null && current !== undefined && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key]
      } else {
        current = undefined
        break
      }
    }
  }

  if (current === undefined || current === null) {
    return ''
  }
  return String(current)
}

/**
 * Validates the asynchronous cryptographic signature sent by Wompi on every webhook call.
 * Official Algorithm:
 * 1. Extract values of properties specified in event.signature.properties in declared order from event.data.
 * 2. Concatenate: values + event.timestamp + events_secret.
 * 3. Evaluate SHA-256 hash.
 * 4. Verify checksum with constant-time comparison (crypto.timingSafeEqual).
 *
 * @param event The complete incoming JSON payload from Wompi
 * @param customSecret Optional override for secret key
 */
export function verifyWebhookSignature(
  event: WompiWebhookEvent,
  customSecret?: string
): {
  isValid: boolean
  calculatedChecksum: string
  receivedChecksum: string
  error?: string
} {
  if (!event || !event.signature || !Array.isArray(event.signature.properties)) {
    return {
      isValid: false,
      calculatedChecksum: '',
      receivedChecksum: '',
      error: 'Payload lacks signature or properties definition',
    }
  }

  const { properties, checksum } = event.signature
  const timestamp = event.timestamp
  const { eventsSecret } = getWompiKeys()
  const secretToUse = customSecret || eventsSecret

  if (!secretToUse) {
    return {
      isValid: false,
      calculatedChecksum: '',
      receivedChecksum: checksum || '',
      error: 'WOMPI_EVENTS_SECRET is not configured on server',
    }
  }

  // Extract values using dot-notation path traversing event.data
  const extractedValues = properties.map((prop) => extractPropertyFromPayload(event, prop))

  // Concatenate: concatenated properties + timestamp + events_secret
  const stringToSign = `${extractedValues.join('')}${timestamp}${secretToUse}`

  const calculatedChecksum = crypto
    .createHash('sha256')
    .update(stringToSign, 'utf8')
    .digest('hex')
    .toLowerCase()

  const receivedChecksum = (checksum || '').toLowerCase().trim()

  // Constant-time comparison immune to timing side-channels
  let isValid = false
  try {
    const calculatedBuffer = Buffer.from(calculatedChecksum, 'hex')
    const receivedBuffer = Buffer.from(receivedChecksum, 'hex')

    if (
      calculatedBuffer.length === 32 &&
      receivedBuffer.length === 32
    ) {
      isValid = crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)
    } else {
      // Force constant-time comparison against itself to neutralize timing discrepancies
      crypto.timingSafeEqual(calculatedBuffer, calculatedBuffer)
      isValid = false
    }
  } catch (timingErr) {
    console.error('[wompi:verifyWebhookSignature] Error in timing-safe comparison:', timingErr)
    isValid = false
  }

  return {
    isValid,
    calculatedChecksum,
    receivedChecksum,
  }
}

// ─── 3. Hosted Checkout URL Builder (Zero PCI Scope) ──────────────────────────

/**
 * Builds the official Wompi Hosted Checkout Redirection URL.
 * Guarantees zero handling of sensitive card data on client or server.
 * Customer fills billing/shipping details and is redirected straight to checkout.wompi.co.
 */
export function buildWompiCheckoutUrl(params: WompiCheckoutParams): string {
  const { publicKey } = getWompiKeys()
  const keyToUse = params.publicKey || publicKey

  if (!keyToUse) {
    throw new Error('[wompi:checkout_url] Missing Wompi Public Key for Checkout redirection')
  }

  const currency = params.currency || 'COP'
  const integrityHash =
    params.integrityHash || generateIntegrityHash(params.reference, params.amountInCents, currency)

  const searchParams = new URLSearchParams()
  searchParams.set('public-key', keyToUse)
  searchParams.set('currency', currency)
  searchParams.set('amount-in-cents', String(Math.round(params.amountInCents)))
  searchParams.set('reference', params.reference)
  searchParams.set('signature:integrity', integrityHash)

  if (params.redirectUrl) {
    searchParams.set('redirect-url', params.redirectUrl)
  }

  // Customer Data pre-fill
  if (params.customer) {
    if (params.customer.email) {
      searchParams.set('customer-data:email', params.customer.email.trim())
    }
    if (params.customer.fullName) {
      searchParams.set('customer-data:full-name', params.customer.fullName.trim())
    }
    if (params.customer.phone) {
      searchParams.set('customer-data:phone-number', params.customer.phone.replace(/\D/g, ''))
    }
    if (params.customer.document) {
      searchParams.set('customer-data:legal-id', params.customer.document.trim())
    }
    if (params.customer.documentType) {
      searchParams.set('customer-data:legal-id-type', params.customer.documentType)
    }

    // Shipping address pre-fill
    if (params.customer.address) {
      searchParams.set('shipping-address:address-line-1', params.customer.address.trim())
    }
    if (params.customer.city) {
      searchParams.set('shipping-address:city', params.customer.city.trim())
    }
    searchParams.set('shipping-address:country', 'CO')
  }

  // Extraemos el string codificado nativamente
  let queryString = searchParams.toString()

  // 🔴 FIX CRÍTICO ANTI-WAF: Restauramos los dos puntos (:) que URLSearchParams 
  // codificó como %3A, para evitar que el CloudFront de Wompi nos tire error 403.
  queryString = queryString.replace(/signature%3A/g, 'signature:')
  queryString = queryString.replace(/customer-data%3A/g, 'customer-data:')
  queryString = queryString.replace(/shipping-address%3A/g, 'shipping-address:')

  return `${WOMPI_CHECKOUT_BASE_URL}?${queryString}`
}

// ─── 4. Authenticated Server-to-Server REST Client ───────────────────────────

/**
 * Fetches transaction details directly from Wompi's REST API using the Private Key (WOMPI_PRIVATE_KEY).
 * Used for server-side verification, transaction polling, or reconciliation.
 */
export async function getWompiTransactionById(transactionId: string): Promise<WompiTransaction> {
  const { privateKey } = getWompiKeys()

  if (!privateKey) {
    throw new Error('[wompi:api] WOMPI_PRIVATE_KEY is required to query transaction details from Wompi API')
  }

  const baseUrl = getWompiApiBaseUrl()
  const response = await fetch(`${baseUrl}/transactions/${encodeURIComponent(transactionId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const body = await response.json()

  if (!response.ok) {
    const errorDetails = body.error?.messages?.join(', ') || body.message || 'Error consultando transacción Wompi'
    throw new Error(`[wompi:api] ${errorDetails} (HTTP ${response.status})`)
  }

  return body.data as WompiTransaction
}

/**
 * Queries merchant details and acceptance tokens using WOMPI_PUBLIC_KEY.
 */
export async function getWompiMerchantInfo(): Promise<Record<string, unknown>> {
  const { publicKey } = getWompiKeys()
  if (!publicKey) {
    throw new Error('[wompi:merchant] WOMPI_PUBLIC_KEY is not defined')
  }

  const baseUrl = getWompiApiBaseUrl()
  const response = await fetch(`${baseUrl}/merchants/${encodeURIComponent(publicKey)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`[wompi:merchant] Failed to fetch merchant info: ${err.message || response.statusText}`)
  }

  const json = await response.json()
  return json.data
}
