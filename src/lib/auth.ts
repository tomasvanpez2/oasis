/**
 * Enterprise 2FA Authentication & Cryptographic Session Security
 * Implements Edge-compatible Web Crypto HMAC-SHA256 JWT signing, constant-time
 * master password validation, and 6-digit OTP verification.
 */
import type { AdminSessionPayload } from '@/types'

export const ADMIN_COOKIE_NAME = 'oasis_admin_session'
export const CHALLENGE_COOKIE_NAME = 'oasis_admin_challenge'
export const DEFAULT_ADMIN_PASSWORD = 'OasisMaster2026!'

export function getAdminJwtSecret(): string {
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.WOMPI_EVENTS_SECRET ||
    'oasis-colchones-luxury-secret-key-2026'
  )
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Signs a structured JWT payload using standard HMAC-SHA256.
 * Zero external dependencies — runs uniformly in Next.js Edge Middleware and Node.js.
 */
export async function signAdminJWT(
  payload: AdminSessionPayload,
  customSecret?: string
): Promise<string> {
  const enc = new TextEncoder()
  const secret = customSecret || getAdminJwtSecret()
  const key = await getCryptoKey(secret)

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const encodedHeader = base64UrlEncode(enc.encode(JSON.stringify(header)))
  const encodedPayload = base64UrlEncode(enc.encode(JSON.stringify(payload)))
  const dataToSign = enc.encode(`${encodedHeader}.${encodedPayload}`)

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataToSign)
  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer))

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

/**
 * Verifies and parses a signed JWT.
 * Returns the decoded payload or null if tampered, malformed, or expired.
 */
export async function verifyAdminJWT(
  token: string,
  customSecret?: string
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts

  try {
    const enc = new TextEncoder()
    const dec = new TextDecoder()
    const secret = customSecret || getAdminJwtSecret()
    const key = await getCryptoKey(secret)

    const dataToVerify = enc.encode(`${encodedHeader}.${encodedPayload}`)
    const signatureBytes = base64UrlDecode(encodedSignature)

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes as unknown as BufferSource, dataToVerify)
    if (!isValid) {
      return null
    }

    const payloadJson = dec.decode(base64UrlDecode(encodedPayload))
    const payload = JSON.parse(payloadJson) as AdminSessionPayload

    // Strict role check
    if (payload.role !== 'admin') {
      return null
    }

    // Strict expiration check (seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp && nowInSeconds > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Constant-time master password verification to prevent timing attacks.
 */
export function verifyMasterPassword(providedPassword: string): boolean {
  if (!providedPassword || typeof providedPassword !== 'string') {
    return false
  }

  const master = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
  if (providedPassword.length !== master.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < providedPassword.length; i++) {
    mismatch |= providedPassword.charCodeAt(i) ^ master.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Generates a cryptographically strong 6-digit numeric OTP.
 */
export function generateRandomOTP(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  // Maps random 32-bit int to 100000 - 999999
  const otpNumber = 100000 + (array[0] % 900000)
  return otpNumber.toString()
}

/**
 * Generates an opaque random challenge identifier.
 */
export function generateChallengeId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  let hex = ''
  for (let i = 0; i < array.length; i++) {
    hex += array[i].toString(16).padStart(2, '0')
  }
  return `chl_${Date.now()}_${hex}`
}
