import { NextRequest, NextResponse } from 'next/server'
import {
  signAdminJWT,
  ADMIN_COOKIE_NAME,
  CHALLENGE_COOKIE_NAME,
} from '@/lib/auth'
import {
  verifyTOTP,
  getAdminTotpSecret,
  getTotpAuthUri,
  generateTotpQrCodeDataUrl,
  generateTOTP,
} from '@/lib/totp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/verify-totp
 * Returns TOTP setup parameters (QR Code Data URL, Base32 Secret, Apple Passwords URI).
 * Used by the UI when the admin expands the setup accordion.
 */
export async function GET() {
  try {
    const secret = getAdminTotpSecret()
    const otpauthUri = getTotpAuthUri(secret)
    const qrCode = await generateTotpQrCodeDataUrl(otpauthUri)
    const currentCode =
      process.env.NODE_ENV !== 'production' ? await generateTOTP(secret) : undefined

    return NextResponse.json({
      success: true,
      secret,
      otpauthUri,
      qrCode,
      issuer: 'Oasis Colchones',
      account: 'admin@oasis.co',
      ...(currentCode ? { devTotpHint: currentCode } : {}),
    })
  } catch (err) {
    console.error('[admin:verify-totp:get:error]', err)
    return NextResponse.json(
      { error: 'Error al generar los parámetros de configuración 2FA.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/verify-totp
 * Single-step TOTP validation against ADMIN_TOTP_SECRET.
 * Zero master password or pre-challenge required.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawOtp = body.otp || body.code || body.token || ''

    if (!rawOtp || typeof rawOtp !== 'string') {
      return NextResponse.json(
        { error: 'Por favor ingresa el código de 6 dígitos de tu autenticador.' },
        { status: 400 }
      )
    }

    const sanitizedOtp = rawOtp.trim().replace(/\D/g, '')
    if (sanitizedOtp.length !== 6) {
      return NextResponse.json(
        { error: 'El código debe tener exactamente 6 dígitos numéricos.' },
        { status: 400 }
      )
    }

    // Direct validation against RFC 6238 TOTP (Apple Passwords / Google Authenticator)
    const isValid = await verifyTOTP(sanitizedOtp)

    if (!isValid) {
      return NextResponse.json(
        {
          error:
            'Código de verificación incorrecto o expirado. Revisa la hora de tu dispositivo y vuelve a intentarlo.',
        },
        { status: 401 }
      )
    }

    // Validated successfully! Sign enterprise JWT session token (8 hours)
    const sessionToken = await signAdminJWT({
      role: 'admin',
      authTime: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Autenticación 2FA exitosa. Acceso concedido.',
      redirect: '/admin',
    })

    // Set secure, HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    })

    // Clean up any lingering challenge cookies
    response.cookies.delete(CHALLENGE_COOKIE_NAME)

    console.info('[admin:verify-totp:success] Admin authenticated via single-step TOTP.')
    return response
  } catch (err) {
    console.error('[admin:verify-totp:error]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la verificación 2FA.' },
      { status: 500 }
    )
  }
}

