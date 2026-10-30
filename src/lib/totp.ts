/**
 * RFC 6238 TOTP Engine for Google Authenticator & Apple Passwords
 * Implements HMAC-SHA1 dynamic truncation, Base32 decoding, clock skew window
 * validation, anti-replay protection, and QR Code generation.
 */
import QRCode from 'qrcode'

export const TOTP_ISSUER = 'Oasis Colchones'
export const TOTP_ACCOUNT = 'admin@oasis.co'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// Anti-replay cache: stores code -> timestamp when consumed
const usedTotpCodes = new Map<string, number>()

export function getAdminTotpSecret(): string {
  const secret = process.env.ADMIN_TOTP_SECRET || ''
  const sanitized = secret.trim().toUpperCase().replace(/[^A-Z2-7]/g, '')
  if (sanitized.length < 16) {
    throw new Error('ADMIN_TOTP_SECRET no está configurada o es demasiado corta en las variables de entorno.')
  }
  return sanitized
}

/**
 * Standard RFC 4648 Base32 decoder with fault tolerance (maps 0->O, 1->L).
 */
export function base32Decode(input: string): Uint8Array {
  const cleaned = input
    .toUpperCase()
    .replace(/=+$/, '')
    .replace(/\s+/g, '')
    .replace(/0/g, 'O')
    .replace(/1/g, 'L')

  let bits = 0
  let value = 0
  const output: number[] = []

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i])
    if (idx === -1) {
      continue
    }
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

/**
 * Generates an RFC 6238 TOTP code (6 digits) for a given timestamp.
 */
export async function generateTOTP(
  secretBase32: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000)
): Promise<string> {
  const timeStep = Math.floor(timestampSeconds / 30)
  const keyBytes = base32Decode(secretBase32)

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  view.setUint32(0, Math.floor(timeStep / 0x100000000))
  view.setUint32(4, timeStep >>> 0)

  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf))
  const offset = sig[19] & 0x0f
  const binCode =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff)

  return (binCode % 1000000).toString().padStart(6, '0')
}

/**
 * Validates a 6-digit TOTP code against the secret.
 * Includes Anti-Replay protection: once verified, a code cannot be reused for 120 seconds.
 */
export async function verifyTOTP(
  token: string,
  secretBase32?: string,
  window: number = 1
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  const cleanToken = token.trim().replace(/\D/g, '')
  if (cleanToken.length !== 6) return false

  let secret: string
  try {
    secret = secretBase32 || getAdminTotpSecret()
  } catch {
    return false
  }

  const now = Math.floor(Date.now() / 1000)

  // Anti-replay check
  const lastUsed = usedTotpCodes.get(cleanToken)
  if (lastUsed && now - lastUsed < 120) {
    return false
  }

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const expected = await generateTOTP(secret, now + errorWindow * 30)
    if (expected === cleanToken) {
      // Mark code as used to prevent replay attacks
      usedTotpCodes.set(cleanToken, now)

      // Clean expired codes from memory (> 120 seconds old)
      usedTotpCodes.forEach((ts, code) => {
        if (now - ts > 120) {
          usedTotpCodes.delete(code)
        }
      })
      return true
    }
  }

  return false
}

/**
 * Constructs the standard otpauth:// URL for Google Authenticator & Apple Passwords.
 */
export function getTotpAuthUri(
  secretBase32?: string,
  accountName: string = TOTP_ACCOUNT,
  issuer: string = TOTP_ISSUER
): string {
  const secret = secretBase32 || getAdminTotpSecret()
  const encIssuer = encodeURIComponent(issuer)
  const encAccount = encodeURIComponent(accountName)
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Generates high-res QR code as Data URL for inline rendering.
 */
export async function generateTotpQrCodeDataUrl(otpauthUri: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#0A1B54',
      light: '#FFFFFF',
    },
  })
}
