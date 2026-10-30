import { NextRequest, NextResponse } from 'next/server'
import {
  signAdminJWT,
  ADMIN_COOKIE_NAME,
  CHALLENGE_COOKIE_NAME,
} from '@/lib/auth'
import { verifyTOTP } from '@/lib/totp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rate Limiter en memoria: IP -> { attempts: number, lockUntil: number }
interface RateLimitEntry {
  attempts: number
  lockUntil: number
}
const rateLimitMap = new Map<string, RateLimitEntry>()

const MAX_FAILED_ATTEMPTS = 5
const LOCK_TIME_MS = 15 * 60 * 1000 // 15 minutos

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || '127.0.0.1'
}

/**
 * POST /api/admin/verify-totp
 * Validación directa de código TOTP contra la variable de entorno ADMIN_TOTP_SECRET.
 * Incluye Rate Limiting (máximo 5 intentos fallidos por IP) y protección Anti-Replay.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const now = Date.now()

  // 1. Verificar Rate Limiting
  const rateRecord = rateLimitMap.get(ip)
  if (rateRecord && rateRecord.lockUntil > now) {
    const remainingMinutes = Math.ceil((rateRecord.lockUntil - now) / 60000)
    return NextResponse.json(
      {
        error: `Demasiados intentos incorrectos. Bloqueado por seguridad durante ${remainingMinutes} minuto(s).`,
      },
      { status: 429 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const rawOtp = body.otp || body.code || ''

    if (!rawOtp || typeof rawOtp !== 'string') {
      return NextResponse.json(
        { error: 'Por favor ingresa el código de 6 dígitos.' },
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

    // 2. Validación directa contra RFC 6238 TOTP (Google Authenticator / Apple Passwords)
    const isValid = await verifyTOTP(sanitizedOtp)

    if (!isValid) {
      // Registrar intento fallido
      const currentAttempts = (rateRecord?.attempts || 0) + 1
      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        rateLimitMap.set(ip, {
          attempts: currentAttempts,
          lockUntil: now + LOCK_TIME_MS,
        })
      } else {
        rateLimitMap.set(ip, {
          attempts: currentAttempts,
          lockUntil: 0,
        })
      }

      return NextResponse.json(
        { error: 'Mal código' },
        { status: 401 }
      )
    }

    // 3. Código válido: limpiar récord de intentos de la IP
    rateLimitMap.delete(ip)

    // 4. Firmar token de sesión JWT administrativo (8 horas)
    const sessionToken = await signAdminJWT({
      role: 'admin',
      authTime: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    })

    const response = NextResponse.json({
      success: true,
      redirect: '/admin',
    })

    // 5. Configurar cookie segura HTTP-only
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    })

    // Limpiar cookies de desafío previas si existieran
    response.cookies.delete(CHALLENGE_COOKIE_NAME)

    return response
  } catch (err) {
    console.error('[admin:verify-totp:error]', err)
    return NextResponse.json(
      { error: 'Error del servidor al procesar la verificación.' },
      { status: 500 }
    )
  }
}
