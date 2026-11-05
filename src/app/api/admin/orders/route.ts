import { NextRequest, NextResponse } from 'next/server'
import { getOrders, updateOrderStatus } from '@/lib/blob'
import { BI_CATEGORIES, type OrderStatus, type BICategory, type Order } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')?.toLowerCase()
    const viewParam = searchParams.get('view')?.toLowerCase() // 'production' | 'attempts' | 'all'

    const db = await getOrders()
    const allOrders = (db.orders || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Compute Global BI Metrics across all orders
    let totalRevenue = 0
    let pendingRevenue = 0
    let processedOrdersCount = 0

    const statusCounts: Record<string, number> = {
      pending: 0,
      payment_pending: 0,
      approved: 0,
      production: 0,
      dispatched: 0,
      delivered: 0,
      declined: 0,
      voided: 0,
      error: 0,
    }

    const categoryStats: Record<
      BICategory,
      { label: string; totalCOP: number; count: number; percentage: number }
    > = {
      '1_Colchones_Premium': {
        label: 'Colchones Premium (Látex, Talalay, Híbridos)',
        totalCOP: 0,
        count: 0,
        percentage: 0,
      },
      '2_Colchones_Estandar': {
        label: 'Colchones Estándar (Espuma HR, Resortes)',
        totalCOP: 0,
        count: 0,
        percentage: 0,
      },
      '3_Bases_y_Muebles': {
        label: 'Bases, Somieres y Mobiliario',
        totalCOP: 0,
        count: 0,
        percentage: 0,
      },
      '4_Almohadas_y_Complementos': {
        label: 'Almohadas y Complementos de Descanso',
        totalCOP: 0,
        count: 0,
        percentage: 0,
      },
      '5_Combos_Especiales': {
        label: 'Combos Especiales y Promociones',
        totalCOP: 0,
        count: 0,
        percentage: 0,
      },
    }

    for (const order of allOrders) {
      const orderTotal = Number(order.total) || 0
      const st = (order.status || 'pending').toLowerCase()
      statusCounts[st] = (statusCounts[st] || 0) + 1

      // Revenue: include all confirmed/active paid sales
      const isApprovedOrActive = ['approved', 'production', 'dispatched', 'delivered'].includes(st)
      if (isApprovedOrActive) {
        totalRevenue += orderTotal
        processedOrdersCount += 1
      } else if (st === 'pending' || st === 'payment_pending') {
        pendingRevenue += orderTotal
      }

      // Categorize
      const cat = (order.biCategory as BICategory) || '2_Colchones_Estandar'
      if (categoryStats[cat]) {
        categoryStats[cat].totalCOP += orderTotal
        categoryStats[cat].count += 1
      }
    }

    // Calculate percentages
    const grandTotalAllOrders = totalRevenue + pendingRevenue || 1
    for (const key of BI_CATEGORIES) {
      const cat = categoryStats[key]
      cat.percentage = Math.round((cat.totalCOP / grandTotalAllOrders) * 100)
    }

    const averageTicket = processedOrdersCount > 0 ? Math.round(totalRevenue / processedOrdersCount) : 0

    // Filter orders deterministically based on query parameters
    let filteredOrders: Order[] = allOrders

    if (viewParam === 'production') {
      // Production view strictly filters approved or active paid orders
      if (statusParam) {
        filteredOrders = allOrders.filter((o) => o.status === statusParam)
      } else {
        // Default production queue: STRICTLY approved
        filteredOrders = allOrders.filter((o) => o.status === 'approved')
      }
    } else if (viewParam === 'attempts') {
      // Unconfirmed payment attempts, abandoned carts, or gateway failures
      const attemptStatuses = ['payment_pending', 'pending', 'declined', 'error', 'voided']
      if (statusParam) {
        filteredOrders = allOrders.filter((o) => o.status === statusParam)
      } else {
        filteredOrders = allOrders.filter((o) => attemptStatuses.includes(o.status))
      }
    } else if (statusParam) {
      filteredOrders = allOrders.filter((o) => o.status === statusParam)
    }

    return NextResponse.json({
      orders: filteredOrders,
      metrics: {
        totalRevenue,
        pendingRevenue,
        averageTicket,
        totalOrders: allOrders.length,
        processedOrdersCount,
        statusCounts,
        categoryStats,
      },
    })
  } catch (err) {
    console.error('[api/admin/orders:GET:error]', err)
    return NextResponse.json({ error: 'Error al cargar los pedidos de Vercel Blob' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { orderId, status } = body as { orderId: string; status: OrderStatus }

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Se requiere orderId y el nuevo status operacional' },
        { status: 400 }
      )
    }

    const validStatuses: OrderStatus[] = [
      'pending',
      'payment_pending',
      'approved',
      'production',
      'dispatched',
      'delivered',
      'declined',
      'voided',
      'error',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Opciones válidas: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await updateOrderStatus(orderId, status)

    if (!updated) {
      return NextResponse.json({ error: `Orden ${orderId} no encontrada` }, { status: 404 })
    }

    console.info(`[admin:order:updated] Order ${orderId} status changed to ${status}`)
    return NextResponse.json({ success: true, order: updated })
  } catch (err) {
    console.error('[api/admin/orders:PATCH:error]', err)
    return NextResponse.json({ error: 'Error al actualizar el estado de la orden' }, { status: 500 })
  }
}
