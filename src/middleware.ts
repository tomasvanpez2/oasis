/**
 * Next.js Edge Security Middleware
 * Hardens `/admin` against unauthorized access.
 * Enforces cryptographic HMAC-SHA256 session token verification for all admin routes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminJWT, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Allow public authentication endpoints
  const isAuthApi =
    pathname.startsWith('/api/admin/auth') ||
    pathname.startsWith('/api/admin/verify-totp')
  const isLoginPage = pathname === '/admin/login'

  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  const session = sessionCookie ? await verifyAdminJWT(sessionCookie) : null
  const isAuthenticated = Boolean(session && session.role === 'admin')

  // If user is already authenticated and visits /admin/login, redirect to /admin dashboard
  if (isLoginPage) {
    if (isAuthenticated) {
      const dashboardUrl = new URL('/admin', req.url)
      return NextResponse.redirect(dashboardUrl)
    }
    return NextResponse.next()
  }

  // Allow auth API routes (login step1, step2, etc.)
  if (isAuthApi) {
    return NextResponse.next()
  }

  // Protect Admin API routes with 401 JSON
  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          error: 'Acceso no autorizado. Se requiere sesión de administrador 2FA activa.',
          code: 'UNAUTHORIZED_ADMIN_SESSION',
        },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Protect /admin and all subpaths
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', req.url)
      // Pass original destination for seamless redirect after 2FA login
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('from', pathname)
      }
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}

