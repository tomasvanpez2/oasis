import { NextRequest, NextResponse } from 'next/server'
import {
  verifyMasterPassword,
  generateChallengeId,
  CHALLENGE_COOKIE_NAME,
} from '@/lib/auth'
import {
  getAdminTotpSecret,
  getTotpAuthUri,
  generateTotpQrCodeDataUrl,
  generateTOTP,
} from '@/lib/totp'
import { sendTelegramOTP } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Debes ingresar la contraseña maestra de administración.' },
        { status: 400 }
      )
    }

    // 1. Verify Master Password
    const isValid = verifyMasterPassword(password.trim())
    if (!isValid) {
      console.warn('[admin:auth:step1] Contraseña maestra incorrecta rechazada.')
      return NextResponse.json(
        { error: 'Contraseña maestra inválida. Acceso restringido.' },
        { status: 401 }
      )
    }

    // 2. Prepare TOTP parameters for Google Authenticator & Apple Passwords
    const secret = getAdminTotpSecret()
    const otpauthUri = getTotpAuthUri(secret)
    const qrCodeDataUrl = await generateTotpQrCodeDataUrl(otpauthUri)
    const challengeId = generateChallengeId()

    // 3. Current active code for dev verification
    const currentCode = await generateTOTP(secret)

    // 4. Send background operational notice to Telegram group
    sendTelegramOTP(currentCode).catch((tgErr) =>
      console.warn('[telegram:notice:warn]', tgErr)
    )

    // Construct response
    const res = NextResponse.json({
      success: true,
      step: 'totp_required',
      challengeId,
      secret,
      otpauthUri,
      qrCode: qrCodeDataUrl,
      issuer: 'Oasis Colchones',
      account: 'admin@oasis.co',
      message: 'Ingresa el código dinámico de 6 dígitos de Google Authenticator o Contraseñas de Apple.',
      ...(process.env.NODE_ENV !== 'production' ? { devTotpHint: currentCode } : {}),
    })

    // Set temporary challenge cookie (10 minutes)
    res.cookies.set({
      name: CHALLENGE_COOKIE_NAME,
      value: challengeId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    })

    return res
  } catch (err) {
    console.error('[admin:auth:step1:error]', err)
    return NextResponse.json(
      { error: 'Error del servidor durante la generación del desafío 2FA TOTP.' },
      { status: 500 }
    )
  }
}
