import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrder, classifyOrderCategory } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import { verifyAdminJWT, ADMIN_COOKIE_NAME } from '@/lib/auth'
import { resolveShippingFromLocation } from '@/lib/shipping'
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
    const { customer, items } = body

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Datos de orden o ítems inválidos' }, { status: 400 })
    }

    // Zero-Trust: Recálculo en servidor de flete e importe total (100% flete o $0 para accesorios)
    const shippingResolution = resolveShippingFromLocation(customer.city, customer.localidad || customer.department, items)
    const trustedShippingFee = shippingResolution.isCovered ? shippingResolution.zone.price : 0
    const trustedShippingZone = shippingResolution.zone.name

    const trustedSubtotal = items.reduce(
      (acc: number, i: { price?: number; quantity?: number }) =>
        acc + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0
    )
    const trustedTotal = trustedSubtotal + trustedShippingFee
    const biCategory = classifyOrderCategory(items, trustedTotal)

    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      wompiReference: generateOrderReference(),
      status: 'payment_pending',
      biCategory,
      customer: {
        ...customer,
        shippingZoneId: shippingResolution.zone.id,
        shippingZoneName: trustedShippingZone,
      },
      items,
      subtotal: trustedSubtotal,
      shipping: trustedShippingFee,
      shippingZone: trustedShippingZone,
      total: trustedTotal,
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
