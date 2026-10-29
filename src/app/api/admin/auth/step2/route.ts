import { NextRequest, NextResponse } from 'next/server'
import {
  signAdminJWT,
  ADMIN_COOKIE_NAME,
  CHALLENGE_COOKIE_NAME,
} from '@/lib/auth'
import { verifyTOTP } from '@/lib/totp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { otp, challengeId: bodyChallengeId } = body

    const cookieChallengeId = req.cookies.get(CHALLENGE_COOKIE_NAME)?.value
    const challengeId = (bodyChallengeId || cookieChallengeId || '').trim()

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'Debes ingresar el código de 6 dígitos de tu app de autenticación.' },
        { status: 400 }
      )
    }

    if (!challengeId) {
      return NextResponse.json(
        {
          error: 'Desafío 2FA no iniciado o expirado. Por favor ingresa primero la contraseña maestra.',
          restartRequired: true,
        },
        { status: 400 }
      )
    }

    const sanitizedOtp = otp.trim().replace(/\D/g, '')
    if (sanitizedOtp.length !== 6) {
      return NextResponse.json(
        { error: 'El código debe tener exactamente 6 dígitos numéricos.' },
        { status: 400 }
      )
    }

    // 1. Verify against RFC 6238 TOTP (Google Authenticator / Apple Passwords)
    const isValid = await verifyTOTP(sanitizedOtp)

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Código 2FA incorrecto o desfasado. Asegúrate de ingresar el código actual de Google Authenticator o Apple Passwords.',
        },
        { status: 401 }
      )
    }

    // 2. Code is valid! Create Session JWT (valid for 8 hours)
    const sessionToken = await signAdminJWT({
      role: 'admin',
      authTime: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Autenticación 2FA exitosa. Bienvenido al panel de Oasis Colchones.',
      redirect: '/admin',
    })

    // 3. Set HTTP-only, secure session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    })

    // 4. Clear challenge cookie
    response.cookies.delete(CHALLENGE_COOKIE_NAME)

    console.info('[admin:auth:step2:success] Admin authenticated via Google Authenticator / Apple Passwords TOTP.')
    return response
  } catch (err) {
    console.error('[admin:auth:step2:error]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor durante la verificación TOTP.' },
      { status: 500 }
    )
  }
}
