import { NextRequest, NextResponse } from 'next/server'
import { getCatalog, updateCatalog } from '@/lib/blob'

export async function GET() {
  try {
    const catalog = await getCatalog()
    return NextResponse.json(catalog)
  } catch (err) {
    console.error('[api/catalog GET]', err)
    return NextResponse.json({ error: 'Error al obtener el catálogo' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    await updateCatalog(body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/catalog PUT]', err)
    return NextResponse.json({ error: 'Error al actualizar el catálogo' }, { status: 500 })
  }
}
