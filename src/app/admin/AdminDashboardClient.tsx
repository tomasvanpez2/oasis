'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus, BICategory } from '@/types'
import { BI_CATEGORIES } from '@/types'
import { formatCOP } from '@/lib/utils'
import { sanitizeColombianPhone, buildWhatsAppCustomerMessage } from '@/lib/telegram'

interface AdminDashboardClientProps {
  initialOrders: Order[]
}

const CATEGORY_METADATA: Record<
  BICategory,
  { label: string; tag: string; description: string; icon: string }
> = {
  '1_Colchones_Premium': {
    label: 'Colchones Premium',
    tag: 'Premium',
    description: 'Látex Talalay, Híbridos y Línea Olimpo/Nebula',
    icon: '👑',
  },
  '2_Colchones_Estandar': {
    label: 'Colchones Estándar',
    tag: 'Estándar',
    description: 'Espuma Alta Resiliencia (HR) y Resortes Pocket',
    icon: '🛏️',
  },
  '3_Bases_y_Muebles': {
    label: 'Bases y Muebles',
    tag: 'Bases',
    description: 'Somieres, Camas Tapizadas y Cabeceros',
    icon: '🪵',
  },
  '4_Almohadas_y_Complementos': {
    label: 'Almohadas y Complementos',
    tag: 'Almohadas',
    description: 'Almohadas Ergonómicas, Toppers y Protectores',
    icon: '☁️',
  },
  '5_Combos_Especiales': {
    label: 'Combos Especiales',
    tag: 'Combos',
    description: 'Paquetes Promocionales y Sets Completos',
    icon: '✨',
  },
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: 'Pendiente',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  approved: {
    label: 'Aprobado',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  production: {
    label: 'Producción',
    bg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
  },
  dispatched: {
    label: 'Despachado',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  delivered: {
    label: 'Entregado',
    bg: 'bg-teal-950/40',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
    dot: 'bg-teal-400',
  },
  declined: {
    label: 'Declinado',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
  },
  voided: {
    label: 'Anulado',
    bg: 'bg-neutral-900/60',
    text: 'text-neutral-400',
    border: 'border-neutral-700/40',
    dot: 'bg-neutral-500',
  },
  error: {
    label: 'Error',
    bg: 'bg-red-950/50',
    text: 'text-red-300',
    border: 'border-red-500/40',
    dot: 'bg-red-400',
  },
}

export default function AdminDashboardClient({ initialOrders }: AdminDashboardClientProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type })
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // Refresh data from server (silently in background or manually)
  const handleRefresh = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (!res.ok) throw new Error('Error al sincronizar pedidos')
      const data = await res.json()
      if (Array.isArray(data.orders)) {
        setOrders(data.orders)
      }
      if (!silent) showToast('Datos sincronizados correctamente')
    } catch {
      if (!silent) showToast('Error al refrescar datos del servidor', 'error')
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }

  // Auto-polling en background cada 20s para mantener el panel siempre actualizado
  useEffect(() => {
    const timer = setInterval(() => {
      handleRefresh(true)
    }, 20000)
    return () => clearInterval(timer)
  }, [])

  // Update order operational status (Auto-save instantáneo)
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)

    // 1. Optimistic update: la UI y las métricas de BI cambian al instante
    const previousOrders = [...orders]
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId || order.wompiReference === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    )

    try {
      // 2. Persistencia automática inmediata en el backend
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el estado')
      }

      showToast(`✓ Estado guardado automáticamente: "${STATUS_CONFIG[newStatus]?.label || newStatus}"`)
      router.refresh()
    } catch (err: unknown) {
      // Rollback en caso de fallo de red
      setOrders(previousOrders)
      showToast(err instanceof Error ? err.message : 'Error al guardar estado', 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch {
      router.push('/admin/login')
    }
  }

  // ─── Business Intelligence Analytics Calculations ─────────────────────────
  const analytics = useMemo(() => {
    let totalRevenue = 0
    let pendingRevenue = 0
    let approvedOrdersCount = 0

    const counts: Record<OrderStatus, number> = {
      pending: 0,
      approved: 0,
      production: 0,
      dispatched: 0,
      delivered: 0,
      declined: 0,
      voided: 0,
      error: 0,
    }

    const biBreakdown: Record<BICategory, { totalCOP: number; count: number }> = {
      '1_Colchones_Premium': { totalCOP: 0, count: 0 },
      '2_Colchones_Estandar': { totalCOP: 0, count: 0 },
      '3_Bases_y_Muebles': { totalCOP: 0, count: 0 },
      '4_Almohadas_y_Complementos': { totalCOP: 0, count: 0 },
      '5_Combos_Especiales': { totalCOP: 0, count: 0 },
    }

    for (const order of orders) {
      const amount = Number(order.total) || 0
      const st = order.status || 'pending'
      counts[st] = (counts[st] || 0) + 1

      const isActiveSale = ['approved', 'production', 'dispatched', 'delivered'].includes(st)
      if (isActiveSale) {
        totalRevenue += amount
        approvedOrdersCount += 1
      } else if (st === 'pending') {
        pendingRevenue += amount
      }

      // Group into BI Categories
      const cat = (order.biCategory as BICategory) || '2_Colchones_Estandar'
      if (biBreakdown[cat]) {
        biBreakdown[cat].totalCOP += amount
        biBreakdown[cat].count += 1
      }
    }

    const averageTicket = approvedOrdersCount > 0 ? Math.round(totalRevenue / approvedOrdersCount) : 0
    const grandVolume = totalRevenue + pendingRevenue || 1

    const categoriesList = BI_CATEGORIES.map((catKey) => {
      const item = biBreakdown[catKey]
      const percentage = Math.round((item.totalCOP / grandVolume) * 100)
      return {
        key: catKey,
        ...CATEGORY_METADATA[catKey],
        totalCOP: item.totalCOP,
        count: item.count,
        percentage,
      }
    })

    return {
      totalRevenue,
      pendingRevenue,
      averageTicket,
      totalOrdersCount: orders.length,
      approvedOrdersCount,
      counts,
      categoriesList,
    }
  }, [orders])

  // Filtered orders list for the table
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchRef = order.wompiReference?.toLowerCase().includes(query)
        const matchTx = order.wompiTransactionId?.toLowerCase().includes(query)
        const matchName = order.customer?.fullName?.toLowerCase().includes(query)
        const matchEmail = order.customer?.email?.toLowerCase().includes(query)
        const matchCity = order.customer?.city?.toLowerCase().includes(query)
        const matchDoc = order.customer?.document?.toLowerCase().includes(query)
        if (!matchRef && !matchTx && !matchName && !matchEmail && !matchCity && !matchDoc) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== 'all' && order.biCategory !== categoryFilter) {
        return false
      }

      return true
    })
  }, [orders, searchTerm, statusFilter, categoryFilter])

  return (
    <div className="min-h-screen bg-[#0A1B54] text-ivory selection:bg-gold/30 selection:text-white font-body pb-20">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-sm flex items-center gap-3 ${
              feedbackToast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{feedbackToast.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A1B54]/90 backdrop-blur-md border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <span className="font-display text-2xl tracking-[0.2em] uppercase text-gold group-hover:text-gold-light transition-colors">
                OASIS
              </span>
              <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-ivory/50 border-l border-gold/30 pl-3">
                Operaciones & BI
              </span>
            </Link>
            <span className="bg-gold/10 border border-gold/30 text-gold text-2xs uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              2FA Activo
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save status badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-2xs text-emerald-300 font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-guardado activo</span>
            </div>

            <button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className="bg-[#0D2266] hover:bg-[#1A2E6B] text-gold/80 hover:text-gold border border-gold/25 p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Sincronización en vivo activa (Click para forzar chequeo)"
            >
              <span className={`inline-block text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                ↻
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title & Date Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gold/10">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-ivory tracking-tight">
              Dashboard de Producción & Ventas
            </h1>
            <p className="text-xs sm:text-sm text-ivory/60 mt-1">
              Control operacional en tiempo real sincronizado con Vercel Blob y Telegram Bot.
            </p>
          </div>
          <div className="text-left md:text-right text-xs text-gold/80 font-mono">
            <span>Hora Colombia: </span>
            <span className="text-ivory">
              {new Date().toLocaleDateString('es-CO', {
                timeZone: 'America/Bogota',
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* ─── 1. KPI CARDS ──────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* KPI 1: Ingresos Totales */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/25 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gold mb-2">
              <span>Ingresos Totales (COP)</span>
              <span className="text-lg">💰</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ivory font-bold tracking-tight">
              {formatCOP(analytics.totalRevenue)}
            </div>
            <div className="mt-3 flex items-center justify-between text-2xs text-ivory/60 border-t border-gold/10 pt-3">
              <span>Órdenes aprobadas y activas:</span>
              <span className="font-mono text-gold font-semibold">{analytics.approvedOrdersCount} pedidos</span>
            </div>
            {analytics.pendingRevenue > 0 && (
              <div className="mt-1 flex items-center justify-between text-2xs text-amber-400/80">
                <span>En trámite / pendientes:</span>
                <span className="font-mono">+{formatCOP(analytics.pendingRevenue)}</span>
              </div>
            )}
          </div>

          {/* KPI 2: Ticket Promedio */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/25 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gold mb-2">
              <span>Ticket Promedio (COP)</span>
              <span className="text-lg">📊</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ivory font-bold tracking-tight">
              {formatCOP(analytics.averageTicket)}
            </div>
            <div className="mt-3 flex items-center justify-between text-2xs text-ivory/60 border-t border-gold/10 pt-3">
              <span>Rendimiento por transacción:</span>
              <span className="font-mono text-emerald-400">Alta Gama Oasis</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-2xs text-ivory/40">
              <span>Base de cálculo:</span>
              <span>Solo pedidos con liquidación</span>
            </div>
          </div>

          {/* KPI 3: Total de Órdenes & Estados */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/25 rounded-2xl p-6 relative overflow-hidden shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gold mb-2">
              <span>Total de Órdenes</span>
              <span className="text-lg">📦</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl text-ivory font-bold tracking-tight">
              {analytics.totalOrdersCount}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1 border-t border-gold/10 pt-3 text-center">
              <div className="bg-[#0A1B54]/70 p-1.5 rounded-lg border border-amber-500/20">
                <div className="text-2xs text-amber-300">Pendiente</div>
                <div className="font-mono text-xs font-bold text-amber-200">
                  {analytics.counts.pending}
                </div>
              </div>
              <div className="bg-[#0A1B54]/70 p-1.5 rounded-lg border border-blue-500/20">
                <div className="text-2xs text-blue-300">Fábrica</div>
                <div className="font-mono text-xs font-bold text-blue-200">
                  {analytics.counts.production}
                </div>
              </div>
              <div className="bg-[#0A1B54]/70 p-1.5 rounded-lg border border-purple-500/20">
                <div className="text-2xs text-purple-300">Despacho</div>
                <div className="font-mono text-xs font-bold text-purple-200">
                  {analytics.counts.dispatched}
                </div>
              </div>
              <div className="bg-[#0A1B54]/70 p-1.5 rounded-lg border border-teal-500/20">
                <div className="text-2xs text-teal-300">Entrega</div>
                <div className="font-mono text-xs font-bold text-teal-200">
                  {analytics.counts.delivered}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. BI CATEGORIES ANALYTICS (NATIVE PROGRESS BARS) ────────── */}
        <section className="bg-[#0D2266]/70 backdrop-blur-md border border-gold/25 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-ivory flex items-center gap-2">
                <span>📈 Desglose Estratégico por Categoría BI</span>
              </h2>
              <p className="text-xs text-ivory/60 mt-0.5">
                Volumen de facturación clasificado en las 5 categorías oficiales de Oasis Colchones.
              </p>
            </div>
            <span className="text-2xs uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full self-start sm:self-auto">
              5 Categorías BI
            </span>
          </div>

          <div className="space-y-5">
            {analytics.categoriesList.map((category) => (
              <div
                key={category.key}
                className="bg-[#0A1B54]/60 p-4 rounded-xl border border-gold/15 hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{category.icon}</span>
                    <span className="font-medium text-sm text-ivory">{category.label}</span>
                    <span className="text-2xs text-gold/70 bg-gold/5 px-2 py-0.5 rounded border border-gold/15">
                      {category.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-ivory/60 font-mono">
                      {category.count} {category.count === 1 ? 'orden' : 'órdenes'}
                    </span>
                    <span className="font-mono font-bold text-gold text-sm">
                      {formatCOP(category.totalCOP)}
                    </span>
                    <span className="font-mono text-2xs text-ivory/80 min-w-10 text-right">
                      {category.percentage}%
                    </span>
                  </div>
                </div>

                {/* Native Tailwind Progress Bar */}
                <div className="w-full bg-[#0D2266] h-3 rounded-full overflow-hidden p-0.5 border border-gold/20">
                  <div
                    className="h-full bg-gradient-to-r from-gold/70 via-gold to-gold-light rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                    style={{ width: `${Math.max(category.percentage, category.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <div className="text-2xs text-ivory/40 mt-1.5 flex justify-between">
                  <span>{category.description}</span>
                  <span className="font-mono text-2xs text-gold/50">{category.key}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 3. INTERACTIVE ORDERS TABLE ─────────────────────────────────── */}
        <section className="bg-[#0D2266]/70 backdrop-blur-md border border-gold/25 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Table Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-ivory flex items-center gap-2">
                <span>📋 Gestión de Pedidos & Despachos</span>
              </h2>
              <p className="text-xs text-ivory/60 mt-0.5">
                Supervisión de pedidos de Vercel Blob, cambio de estados operacionales y contacto directo por WhatsApp.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                placeholder="Buscar por cliente, ref, Wompi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A1B54] border border-gold/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 text-xs">
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-gold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gold/10">
            <span className="text-2xs uppercase tracking-widest text-gold/70 mr-1">Filtrar Estado:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendiente' },
              { id: 'approved', label: 'Aprobado' },
              { id: 'production', label: 'Producción' },
              { id: 'dispatched', label: 'Despachado' },
              { id: 'delivered', label: 'Entregado' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-2xs uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-gold text-[#0A1B54] font-bold shadow-md'
                    : 'bg-[#0A1B54]/70 text-ivory/70 hover:text-gold border border-gold/20'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-2xs uppercase tracking-widest text-gold/70">Categoría:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0A1B54] border border-gold/30 rounded-lg px-2.5 py-1 text-2xs text-ivory focus:outline-none focus:border-gold"
              >
                <option value="all">Todas las Categorías</option>
                {BI_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_METADATA[c]?.tag || c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-gold/20 bg-[#0A1B54]/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#08143F] border-b border-gold/20 text-2xs uppercase tracking-wider text-gold font-medium">
                  <th className="py-3.5 px-4">Referencia / Wompi ID</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente & Contacto</th>
                  <th className="py-3.5 px-4">Destino / Zona</th>
                  <th className="py-3.5 px-4">Categoría BI</th>
                  <th className="py-3.5 px-4 text-right">Total COP</th>
                  <th className="py-3.5 px-4 text-center">Estado Operacional</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ivory/50">
                      No se encontraron pedidos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const stConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    const isExpanded = expandedOrderId === order.id
                    const isUpdating = updatingOrderId === order.id || updatingOrderId === order.wompiReference

                    // Generate prefabricated WhatsApp link
                    const rawPhone = order.customer?.phone || ''
                    const sanitizedPhone = sanitizeColombianPhone(rawPhone)
                    const waMessage = buildWhatsAppCustomerMessage(order)
                    const waUrl = sanitizedPhone
                      ? `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(waMessage)}`
                      : null

                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-[#0D2266]/50 transition-colors">
                          {/* Ref & Wompi ID */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-mono font-semibold text-gold text-xs">
                              {order.wompiReference}
                            </div>
                            {order.wompiTransactionId ? (
                              <div className="font-mono text-2xs text-ivory/50 mt-0.5 truncate max-w-32" title={order.wompiTransactionId}>
                                ID: {order.wompiTransactionId}
                              </div>
                            ) : (
                              <div className="text-2xs text-ivory/40 mt-0.5">Sin ID Wompi</div>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 align-top text-ivory/70 whitespace-nowrap text-2xs">
                            {new Date(order.createdAt).toLocaleDateString('es-CO', {
                              timeZone: 'America/Bogota',
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            <br />
                            <span className="text-ivory/40">
                              {new Date(order.createdAt).toLocaleTimeString('es-CO', {
                                timeZone: 'America/Bogota',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-medium text-ivory">{order.customer?.fullName || 'N/A'}</div>
                            <div className="text-2xs text-ivory/60 mt-0.5">
                              {order.customer?.documentType || 'CC'} {order.customer?.document}
                            </div>
                            <div className="text-2xs text-gold/80 font-mono mt-0.5">
                              {rawPhone || 'Sin teléfono'}
                            </div>
                          </td>

                          {/* Shipping Zone */}
                          <td className="py-4 px-4 align-top">
                            <div className="text-ivory font-medium">
                              {order.shippingZone || order.customer?.city || 'No especificada'}
                            </div>
                            <div className="text-2xs text-ivory/50 truncate max-w-40 mt-0.5" title={order.customer?.address}>
                              {order.customer?.address || 'Sin dirección'}
                            </div>
                          </td>

                          {/* BI Category */}
                          <td className="py-4 px-4 align-top">
                            <span className="inline-block bg-[#0D2266] border border-gold/30 text-gold text-2xs px-2.5 py-1 rounded-full whitespace-nowrap">
                              {CATEGORY_METADATA[order.biCategory]?.tag || order.biCategory}
                            </span>
                          </td>

                          {/* Total COP */}
                          <td className="py-4 px-4 align-top text-right">
                            <div className="font-mono font-bold text-ivory text-sm">
                              {formatCOP(order.total)}
                            </div>
                            <div className="text-2xs text-ivory/40 mt-0.5">
                              {order.wompiPaymentMethod || 'Wompi'}
                            </div>
                          </td>

                          {/* Operational Status Selector */}
                          <td className="py-4 px-4 align-top text-center">
                            <div className="relative inline-block w-36">
                              <select
                                value={order.status}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className={`w-full appearance-none rounded-lg py-1.5 pl-7 pr-6 text-2xs font-semibold uppercase tracking-wider border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold ${
                                  stConfig.bg
                                } ${stConfig.text} ${stConfig.border} disabled:opacity-50`}
                              >
                                <option value="pending" className="bg-[#0A1B54] text-amber-300">
                                  ⏳ Pendiente
                                </option>
                                <option value="approved" className="bg-[#0A1B54] text-emerald-300">
                                  ✅ Aprobado
                                </option>
                                <option value="production" className="bg-[#0A1B54] text-blue-300">
                                  🏭 Producción
                                </option>
                                <option value="dispatched" className="bg-[#0A1B54] text-purple-300">
                                  🚚 Despachado
                                </option>
                                <option value="delivered" className="bg-[#0A1B54] text-teal-300">
                                  📦 Entregado
                                </option>
                                <option value="declined" className="bg-[#0A1B54] text-rose-300">
                                  ❌ Declinado
                                </option>
                                <option value="voided" className="bg-[#0A1B54] text-neutral-400">
                                  🚫 Anulado
                                </option>
                              </select>
                              {/* Status dot */}
                              <span
                                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                  stConfig.dot
                                } ${isUpdating ? 'animate-ping' : ''}`}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ivory/40 pointer-events-none text-2xs">
                                ▼
                              </span>
                            </div>
                          </td>

                          {/* Action Buttons: WhatsApp & Details */}
                          <td className="py-4 px-4 align-top text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* WhatsApp Direct Action Button */}
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded-lg text-2xs font-medium transition-colors"
                                  title="Contactar al cliente con mensaje prefabricado en WhatsApp"
                                >
                                  <span>💬</span>
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-500 px-2 py-1.5 rounded-lg text-2xs"
                                  title="Sin teléfono válido"
                                >
                                  💬 WA
                                </button>
                              )}

                              {/* Toggle Details Accordion */}
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="bg-[#0D2266] hover:bg-[#1A2E6B] border border-gold/30 text-gold px-2 py-1.5 rounded-lg text-2xs transition-colors cursor-pointer"
                                title="Ver detalle de productos y notas"
                              >
                                {isExpanded ? '▲' : '▼'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Order Details Row */}
                        {isExpanded && (
                          <tr className="bg-[#08143F]/80 border-b border-gold/20">
                            <td colSpan={8} className="p-4 sm:p-6">
                              <div className="bg-[#0A1B54] rounded-xl p-4 border border-gold/20 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold/10 pb-3 gap-2">
                                  <h4 className="font-display text-base text-gold flex items-center gap-2">
                                    <span>📦 Productos en la Orden ({order.items?.length || 0})</span>
                                  </h4>
                                  <div className="text-2xs text-ivory/60 font-mono">
                                    Flete: {formatCOP(order.shipping)} | Subtotal: {formatCOP(order.subtotal)}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(order.items || []).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 bg-[#0D2266]/60 p-3 rounded-lg border border-gold/15"
                                    >
                                      {item.imageUrl && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                          src={item.imageUrl}
                                          alt={item.productName}
                                          className="w-12 h-12 object-cover rounded-md border border-gold/20 shrink-0"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-xs text-ivory truncate">
                                          {item.productName}
                                        </div>
                                        <div className="text-2xs text-gold/80">
                                          Medida: {item.size} ({item.dimensions})
                                        </div>
                                        <div className="text-2xs text-ivory/60 font-mono mt-0.5">
                                          {item.quantity} × {formatCOP(item.price)} ={' '}
                                          <span className="font-bold text-ivory">
                                            {formatCOP(item.price * item.quantity)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Customer Notes & Delivery Notes */}
                                {order.customer?.notes && (
                                  <div className="bg-gold/5 p-3 rounded-lg border border-gold/20 text-xs">
                                    <span className="text-gold font-semibold">Notas de despacho del cliente: </span>
                                    <span className="text-ivory/80 italic">{order.customer.notes}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
