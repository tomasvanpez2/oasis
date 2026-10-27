import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrder } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import type { Order } from '@/types'

export async function GET() {
  try {
    const db = await getOrders()
    return NextResponse.json(db)
  } catch (err) {
    console.error('[api/orders GET]', err)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, subtotal, total } = body

    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wompiReference: generateOrderReference(),
      status: 'pending',
      customer,
      items,
      subtotal,
      shipping: 0,
      total,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await saveOrder(order)
    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error('[api/orders POST]', err)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }
}
