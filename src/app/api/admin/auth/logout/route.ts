import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME, CHALLENGE_COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesión administrativa cerrada correctamente.',
    redirect: '/admin/login',
  })

  response.cookies.delete(ADMIN_COOKIE_NAME)
  response.cookies.delete(CHALLENGE_COOKIE_NAME)

  return response
}

