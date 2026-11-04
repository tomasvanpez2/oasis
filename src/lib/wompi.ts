/**
 * Wompi Payment Gateway Integration & Cryptographic Engine
 * Bank-grade security architecture adhering to Wompi Official Developer Specifications.
 *
 * Strict separation of concerns:
 * - 0% PCI-DSS footprint: Zero credit card numbers (PAN), CVVs, or expirations handled on Oasis servers.
 * - Dynamic Environment Inference: Infers Sandbox vs Production strictly based on active keys to eliminate URL mismatches and HTTP 401 errors.
 * - Fail-Closed Zero-Trust Enforcement: Any 401, 404, 500, or non-APPROVED status immediately aborts execution.
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

export const WOMPI_SANDBOX_API = 'https://sandbox.wompi.co/v1/'
export const WOMPI_PROD_API = 'https://production.wompi.co/v1/'
export const WOMPI_CHECKOUT_BASE_URL = 'https://checkout.wompi.co/p/'

// ─── Custom Zero-Trust Error Classes ─────────────────────────────────────────

export class WompiAuthError extends Error {
  readonly statusCode: number = 401
  readonly details?: unknown
  constructor(message: string = 'Fallo Auth Wompi: Verifica Entorno Sandbox/Prod', details?: unknown) {
    super(message)
    this.name = 'WompiAuthError'
    this.details = details
  }
}

export class WompiApiError extends Error {
  readonly statusCode: number
  readonly details?: unknown
  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message)
    this.name = 'WompiApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class WompiTransactionNotApprovedError extends Error {
  readonly statusCode: number = 422
  readonly transactionStatus: string
  readonly transaction: WompiTransaction
  constructor(message: string, status: string, transaction: WompiTransaction) {
    super(message)
    this.name = 'WompiTransactionNotApprovedError'
    this.transactionStatus = status
    this.transaction = transaction
  }
}

// ─── Dynamic Environment & Key Resolution ─────────────────────────────────────

/**
 * Dynamically resolves the active Wompi environment based on keys and environment variables.
 * Test keys ('test') ALWAYS take precedence over NODE_ENV to prevent sending sandbox keys
 * to the production REST endpoint (which causes HTTP 401 Unauthorized errors).
 */
export function getWompiEnvironment(): 'sandbox' | 'production' {
  const privateKey = (
    process.env.WOMPI_PRIVATE_KEY ||
    process.env.WOMPI_PRV_KEY ||
    ''
  ).trim()

  const publicKey = (
    process.env.WOMPI_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
    ''
  ).trim()

  const eventsSecret = (
    process.env.WOMPI_EVENTS_SECRET ||
    process.env.WOMPI_EVENTS_KEY ||
    ''
  ).trim()

  const integritySecret = (
    process.env.WOMPI_INTEGRITY_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    ''
  ).trim()

  const combinedKeys = `${privateKey} ${publicKey} ${eventsSecret} ${integritySecret}`.toLowerCase()

  // 1. Any key containing 'test' strictly enforces Sandbox mode
  if (combinedKeys.includes('test')) {
    return 'sandbox'
  }

  // 2. Explicit environment flag override (if set to test/sandbox)
  const envVar = (process.env.WOMPI_ENVIRONMENT || process.env.WOMPI_ENV || '').toLowerCase().trim()
  if (envVar === 'test' || envVar === 'sandbox') {
    return 'sandbox'
  }

  // 3. If any key contains 'prod', or environment explicitly requested production
  if (combinedKeys.includes('prod') || envVar === 'production' || envVar === 'prod') {
    return 'production'
  }

  // 4. Default: NODE_ENV fallback
  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
}

/**
 * Resolves the 4 fundamental Wompi cryptographic keys from environment variables.
 * In production mode, audits and alerts on missing or dummy keys.
 */
export function getWompiKeys(): WompiKeysConfig {
  const publicKey = (
    process.env.WOMPI_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
    ''
  ).trim()

  const privateKey = (
    process.env.WOMPI_PRIVATE_KEY ||
    process.env.WOMPI_PRV_KEY ||
    ''
  ).trim()

  const eventsSecret = (
    process.env.WOMPI_EVENTS_SECRET ||
    process.env.WOMPI_EVENTS_KEY ||
    ''
  ).trim()

  const integritySecret = (
    process.env.WOMPI_INTEGRITY_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    ''
  ).trim()

  const isProduction = getWompiEnvironment() === 'production'

  // In production, validate that no dummy or empty keys exist
  if (isProduction && process.env.NODE_ENV === 'production') {
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
 * Strictly uses https://sandbox.wompi.co/v1/ for test keys and https://production.wompi.co/v1/ for production keys.
 */
export function getWompiApiBaseUrl(): string {
  const env = getWompiEnvironment()
  return env === 'production' ? WOMPI_PROD_API : WOMPI_SANDBOX_API
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

  // 1. Datos básicos del cliente
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
      searchParams.set('customer-data:legal-id-type', params.customer.documentType || 'CC')
    }

    // 2. Datos de Envío (Wompi exige los 5 parámetros obligatoriamente si envías la dirección)
    if (params.customer.address) {
      searchParams.set('shipping-address:address-line-1', params.customer.address.trim())
      searchParams.set('shipping-address:country', 'CO')
      searchParams.set('shipping-address:city', params.customer.city.trim())
      searchParams.set('shipping-address:phone-number', params.customer.phone.replace(/\D/g, ''))
      searchParams.set('shipping-address:region', params.customer.city.trim())
    }
  }

  let queryString = searchParams.toString()
  
  // Restauramos los dos puntos (:) para que Wompi los lea correctamente
  queryString = queryString.replace(/signature%3A/g, 'signature:')
  queryString = queryString.replace(/customer-data%3A/g, 'customer-data:')
  queryString = queryString.replace(/shipping-address%3A/g, 'shipping-address:')

  return `${WOMPI_CHECKOUT_BASE_URL}?${queryString}`
}

// ─── 4. Authenticated Server-to-Server REST Client (Zero-Trust Fail-Closed) ───

/**
 * Fetches transaction details directly from Wompi's REST API using the Private Key.
 * Enforces strict Fail-Closed security:
 * - Dynamically routes to Sandbox or Production URL to eliminate HTTP 401 mismatches.
 * - Enforces strict Bearer <privateKey> authorization header.
 * - Logs critical error and throws WompiAuthError on HTTP 401.
 * - Aborts immediately on any non-200 HTTP code (404, 500, etc.).
 */
export async function getWompiTransactionById(transactionId: string): Promise<WompiTransaction> {
  if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
    throw new WompiApiError('[wompi:api] transactionId es obligatorio para consultar la transacción', 400)
  }

  const { privateKey } = getWompiKeys()
  const cleanPrivateKey = privateKey.replace(/^Bearer\s+/i, '').trim()

  if (!cleanPrivateKey) {
    const errorMsg = '[wompi:api:CRITICAL] WOMPI_PRIVATE_KEY no está configurada en las variables de entorno'
    console.error(errorMsg)
    throw new WompiAuthError('Fallo Auth Wompi: Verifica Entorno Sandbox/Prod')
  }

  const baseUrl = getWompiApiBaseUrl()
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
  const endpoint = `${cleanBaseUrl}/transactions/${encodeURIComponent(transactionId.trim())}`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cleanPrivateKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  // Fail-Closed: Strict authentication check
  if (response.status === 401) {
    console.error(
      `[wompi:auth:CRITICAL] Fallo Auth Wompi: Verifica Entorno Sandbox/Prod. Endpoint: ${endpoint}, HTTP 401 Unauthorized`
    )
    const errBody = await response.json().catch(() => ({}))
    throw new WompiAuthError('Fallo Auth Wompi: Verifica Entorno Sandbox/Prod', errBody)
  }

  const body = await response.json().catch(() => null)

  // Fail-Closed: Handle any non-200 response (404, 500, 502, etc.)
  if (!response.ok || !body) {
    const errorDetails =
      body?.error?.messages?.join(', ') ||
      body?.error?.reason ||
      body?.message ||
      `HTTP Error ${response.status}`
    throw new WompiApiError(
      `[wompi:api] ${errorDetails} (HTTP ${response.status})`,
      response.status,
      body
    )
  }

  if (!body.data || typeof body.data !== 'object' || !body.data.id) {
    throw new WompiApiError(
      '[wompi:api] Respuesta de Wompi incompleta: no incluye el objeto data de la transacción',
      502,
      body
    )
  }

  return body.data as WompiTransaction
}

/**
 * Verifies that a transaction exists in Wompi and has status strictly 'APPROVED'.
 * Implements strict Zero-Trust and Fail-Closed semantics:
 * Aborts immediately and throws WompiTransactionNotApprovedError if status !== 'APPROVED'.
 */
export async function verifyWompiTransactionApproved(transactionId: string): Promise<WompiTransaction> {
  const transaction = await getWompiTransactionById(transactionId)
  const status = (transaction.status || '').toUpperCase()

  if (status !== 'APPROVED') {
    throw new WompiTransactionNotApprovedError(
      `Transacción Wompi no aprobada. Estado recibido: ${status}`,
      status,
      transaction
    )
  }

  return transaction
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
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
  const response = await fetch(`${cleanBaseUrl}/merchants/${encodeURIComponent(publicKey)}`, {
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
