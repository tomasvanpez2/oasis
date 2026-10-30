import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrder, classifyOrderCategory } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import { verifyAdminJWT, ADMIN_COOKIE_NAME } from '@/lib/auth'
import type { Order } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const db = await getOrders()

    if (reference) {
      const order = db.orders.find((o) => o.wompiReference === reference)
      if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
      }
      return NextResponse.json(order)
    }

    // Si no hay referencia, solo administradores autenticados pueden ver la lista completa
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = cookie ? await verifyAdminJWT(cookie) : null
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso restringido. Solo administradores pueden consultar todas las órdenes.' },
        { status: 401 }
      )
    }

    return NextResponse.json(db)
  } catch (err) {
    console.error('[api/orders GET]', err)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, subtotal, total, shipping = 0 } = body

    const calculatedTotal = total || subtotal + shipping
    const biCategory = classifyOrderCategory(items, calculatedTotal)

    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wompiReference: generateOrderReference(),
      status: 'pending',
      biCategory,
      customer,
      items,
      subtotal,
      shipping,
      total: calculatedTotal,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const saved = await saveOrder(order)
    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('[api/orders POST]', err)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }
}
