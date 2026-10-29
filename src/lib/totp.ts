/**
 * RFC 6238 TOTP Engine for Google Authenticator & Apple Passwords
 * Implements HMAC-SHA1 dynamic truncation, Base32 decoding, clock skew window
 * validation, and QR Code generation.
 */
import QRCode from 'qrcode'

export const DEFAULT_TOTP_SECRET = 'OASISCOLCHONESAUTHKEYENTERPRISE2FA'
export const TOTP_ISSUER = 'Oasis Colchones'
export const TOTP_ACCOUNT = 'admin@oasis.co'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function getAdminTotpSecret(): string {
  const secret = process.env.ADMIN_TOTP_SECRET || DEFAULT_TOTP_SECRET
  const sanitized = secret.trim().toUpperCase().replace(/[^A-Z2-7]/g, '')
  return sanitized.length >= 16 ? sanitized : DEFAULT_TOTP_SECRET
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
 * Checks current 30s window, plus/minus window step (e.g. +/- 30s tolerance).
 */
export async function verifyTOTP(
  token: string,
  secretBase32?: string,
  window: number = 1
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  const cleanToken = token.trim().replace(/\D/g, '')
  if (cleanToken.length !== 6) return false

  const secret = secretBase32 || getAdminTotpSecret()
  const now = Math.floor(Date.now() / 1000)

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const expected = await generateTOTP(secret, now + errorWindow * 30)
    if (expected === cleanToken) {
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

