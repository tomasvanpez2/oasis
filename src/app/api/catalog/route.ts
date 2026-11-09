import { NextRequest, NextResponse } from 'next/server'
import { getCatalog, updateCatalog } from '@/lib/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'Surrogate-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const catalog = await getCatalog()
    return NextResponse.json(catalog, {
      status: 200,
      headers: NO_CACHE_HEADERS,
    })
  } catch (err) {
    console.error('[api/catalog GET]', err)
    return NextResponse.json(
      { error: 'Error al obtener el catálogo' },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    await updateCatalog(body)
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      }
    )
  } catch (err) {
    console.error('[api/catalog PUT]', err)
    return NextResponse.json(
      { error: 'Error al actualizar el catálogo' },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    )
  }
}
