import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint deshabilitado. La autenticación se realiza vía TOTP 2FA directo.' },
    { status: 410 }
  )
}
