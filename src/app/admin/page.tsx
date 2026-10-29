import { Metadata } from 'next'
import { getOrders } from '@/lib/blob'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata: Metadata = {
  title: 'Panel Administrativo & BI | Oasis Colchones',
  description: 'Gestión operacional y analítica Business Intelligence en tiempo real.',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AdminPage() {
  const db = await getOrders()
  const orders = (db.orders || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return <AdminDashboardClient initialOrders={orders} />
}

