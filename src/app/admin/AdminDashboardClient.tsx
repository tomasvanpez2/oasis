'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus, BICategory } from '@/types'
import { BI_CATEGORIES } from '@/types'
import { formatCOP } from '@/lib/utils'
import { sanitizeColombianPhone, buildWhatsAppCustomerMessage } from '@/lib/telegram'

interface AdminDashboardClientProps {
  initialOrders: Order[]
}

type DashboardTab = 'production' | 'attempts'

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
  { label: string; bg: string; text: string; border: string; dot: string; warningText?: string }
> = {
  payment_pending: {
    label: 'Pago Pendiente',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-500/50',
    dot: 'bg-amber-400',
    warningText: 'SIN CONFIRMAR - NO FABRICAR',
  },
  pending: {
    label: 'Pre-orden / Pendiente',
    bg: 'bg-neutral-900/70',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
    warningText: 'SIN CONFIRMAR - NO FABRICAR',
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
    bg: 'bg-rose-950/50',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    dot: 'bg-rose-400',
    warningText: 'DECLINADO POR BANCO - NO FABRICAR',
  },
  voided: {
    label: 'Anulado',
    bg: 'bg-neutral-900/70',
    text: 'text-neutral-400',
    border: 'border-neutral-700/50',
    dot: 'bg-neutral-500',
    warningText: 'ORDEN ANULADA - NO FABRICAR',
  },
  error: {
    label: 'Error Pasarela',
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-500/50',
    dot: 'bg-red-400',
    warningText: 'ERROR TÉCNICO - NO FABRICAR',
  },
}

// Zero-Trust Boundary Sets
const PAID_STATUSES: OrderStatus[] = ['approved', 'production', 'dispatched', 'delivered']
const ATTEMPT_STATUSES: OrderStatus[] = ['payment_pending', 'pending', 'declined', 'error', 'voided']

function buildAbandonedCartMessage(order: Order): string {
  const customerName = order.customer?.fullName?.trim() || 'Cliente'
  const reference = order.wompiReference || order.id
  const formattedTotal = `${formatCOP(order.total).replace(/\u00A0/g, ' ')} COP`
  const itemSummary =
    order.items && order.items.length > 0
      ? order.items.map((i) => `${i.productName} (${i.size})`).join(', ')
      : 'tu pedido'

  return `Hola ${customerName}, te saludamos de Oasis Colchones. Notamos que tu intención de compra (${reference} - ${itemSummary}) por valor de ${formattedTotal} quedó pendiente en la pasarela de pagos. ¿Tuviste algún inconveniente con el método de pago o deseas que te facilitemos un enlace directo o transferencia bancaria para asegurar tu fabricación?`
}

export default function AdminDashboardClient({ initialOrders }: AdminDashboardClientProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Primary Tab System
  const [activeTab, setActiveTab] = useState<DashboardTab>('production')

  // Secondary sub-filters (Zero-Trust Guarded)
  // Default for production: STRICTLY 'approved'
  const [productionFilter, setProductionFilter] = useState<string>('approved')
  // Default for attempts: 'all_attempts'
  const [attemptsFilter, setAttemptsFilter] = useState<string>('all_attempts')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type })
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // Refresh data from server
  const handleRefresh = useCallback(async (silent: boolean = false) => {
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
  }, [])

  // Auto-polling en background cada 20s
  useEffect(() => {
    const timer = setInterval(() => {
      handleRefresh(true)
    }, 20000)
    return () => clearInterval(timer)
  }, [handleRefresh])

  // Update order operational status
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)

    const previousOrders = [...orders]
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId || order.wompiReference === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    )

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el estado')
      }

      showToast(`✓ Estado guardado: "${STATUS_CONFIG[newStatus]?.label || newStatus}"`)
      router.refresh()
    } catch (err: unknown) {
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

  // ─── Zero-Trust Partitioning of Orders ─────────────────────────────────────
  const productionPool = useMemo(() => {
    return orders.filter((o) => PAID_STATUSES.includes(o.status))
  }, [orders])

  const attemptsPool = useMemo(() => {
    return orders.filter((o) => ATTEMPT_STATUSES.includes(o.status))
  }, [orders])

  // ─── Business Intelligence Analytics Calculations ─────────────────────────
  const analytics = useMemo(() => {
    let confirmedRevenue = 0
    let unconfirmedRevenue = 0
    let approvedOrdersCount = 0

    const counts: Record<OrderStatus, number> = {
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

    const biBreakdown: Record<BICategory, { totalCOP: number; count: number }> = {
      '1_Colchones_Premium': { totalCOP: 0, count: 0 },
      '2_Colchones_Estandar': { totalCOP: 0, count: 0 },
      '3_Bases_y_Muebles': { totalCOP: 0, count: 0 },
      '4_Almohadas_y_Complementos': { totalCOP: 0, count: 0 },
      '5_Combos_Especiales': { totalCOP: 0, count: 0 },
    }

    for (const order of orders) {
      const amount = Number(order.total) || 0
      const st = order.status || 'payment_pending'
      counts[st] = (counts[st] || 0) + 1

      const isPaid = PAID_STATUSES.includes(st)
      if (isPaid) {
        confirmedRevenue += amount
        approvedOrdersCount += 1

        const cat = (order.biCategory as BICategory) || '2_Colchones_Estandar'
        if (biBreakdown[cat]) {
          biBreakdown[cat].totalCOP += amount
          biBreakdown[cat].count += 1
        }
      } else {
        unconfirmedRevenue += amount
      }
    }

    const averageTicket = approvedOrdersCount > 0 ? Math.round(confirmedRevenue / approvedOrdersCount) : 0
    const grandVolume = confirmedRevenue || 1

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

    const approvedReadyCount = counts.approved
    const totalPaidPipeline = productionPool.length
    const totalAttemptsCount = attemptsPool.length

    return {
      confirmedRevenue,
      unconfirmedRevenue,
      averageTicket,
      totalOrdersCount: orders.length,
      approvedReadyCount,
      totalPaidPipeline,
      totalAttemptsCount,
      counts,
      categoriesList,
    }
  }, [orders, productionPool.length, attemptsPool.length])

  // ─── Filtered Orders for Production Queue (Zero Trust) ─────────────────────
  // Operational Shield: STRICTLY ONLY APPROVED by default. Non-approved orders NEVER appear here.
  const filteredProductionOrders = useMemo(() => {
    return productionPool.filter((order) => {
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

      if (productionFilter === 'all_paid') {
        // all paid orders in production pool
      } else if (productionFilter) {
        if (order.status !== productionFilter) return false
      } else {
        // Absolute default fallback: strictly approved
        if (order.status !== 'approved') return false
      }

      if (categoryFilter !== 'all' && order.biCategory !== categoryFilter) {
        return false
      }

      return true
    })
  }, [productionPool, searchTerm, productionFilter, categoryFilter])

  // ─── Filtered Orders for Payment Attempts (Carritos / Sin Confirmar) ────────
  const filteredAttemptsOrders = useMemo(() => {
    return attemptsPool.filter((order) => {
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

      if (attemptsFilter === 'all_attempts') {
        // all unconfirmed attempts
      } else if (attemptsFilter === 'payment_pending') {
        if (order.status !== 'payment_pending' && order.status !== 'pending') return false
      } else if (attemptsFilter) {
        if (order.status !== attemptsFilter) return false
      }

      if (categoryFilter !== 'all' && order.biCategory !== categoryFilter) {
        return false
      }

      return true
    })
  }, [attemptsPool, searchTerm, attemptsFilter, categoryFilter])

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
                Operaciones & Taller
              </span>
            </Link>
            <span className="bg-gold/10 border border-gold/30 text-gold text-2xs uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Zero Trust Activo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-2xs text-emerald-300 font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronización en vivo</span>
            </div>

            <button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className="bg-[#0D2266] hover:bg-[#1A2E6B] text-gold/80 hover:text-gold border border-gold/25 p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Refrescar datos del servidor"
            >
              <span className={`inline-block text-sm ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
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
              Control de Planta & Gestión de Órdenes
            </h1>
            <p className="text-xs sm:text-sm text-ivory/60 mt-1">
              Separación operacional estricta: Solo órdenes con pago aprobado van a fabricación.
            </p>
          </div>
          <div className="text-left md:text-right text-xs text-gold/80 font-mono">
            <span>Hora Oficial Colombia: </span>
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

        {/* ─── 1. KPI CARDS (STRICT SEPARATION OF FUNDS) ──────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Ingresos Reales Liquidados */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/25 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-2xs uppercase tracking-widest text-emerald-400 font-bold mb-1.5">
              <span>Ingresos Aprobados</span>
              <span className="text-base">💰</span>
            </div>
            <div className="font-display text-2xl sm:text-3xl text-ivory font-bold tracking-tight">
              {formatCOP(analytics.confirmedRevenue)}
            </div>
            <div className="mt-2 text-2xs text-emerald-300/80 flex items-center justify-between border-t border-gold/10 pt-2 font-mono">
              <span>{analytics.totalPaidPipeline} órdenes pagadas</span>
              <span>100% Cobrado</span>
            </div>
          </div>

          {/* KPI 2: Cola de Producción (Listos para Fabricar) */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/35 rounded-2xl p-5 relative overflow-hidden shadow-xl ring-1 ring-gold/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-2xs uppercase tracking-widest text-gold font-bold mb-1.5">
              <span>Por Fabricar (Aprobadas)</span>
              <span className="text-base">🏭</span>
            </div>
            <div className="font-display text-2xl sm:text-3xl text-gold-light font-bold tracking-tight">
              {analytics.approvedReadyCount} <span className="text-sm font-sans font-normal text-ivory/60">colchones</span>
            </div>
            <div className="mt-2 text-2xs text-gold/80 flex items-center justify-between border-t border-gold/10 pt-2 font-mono">
              <span>Cola operativa inmediata</span>
              <span className="text-emerald-400 font-bold">Listos en Taller</span>
            </div>
          </div>

          {/* KPI 3: Intentos de Pago / Sin Fondos */}
          <div className="bg-[#070e24]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-2xs uppercase tracking-widest text-amber-400 font-bold mb-1.5">
              <span>Intentos de Pago</span>
              <span className="text-base">⚠️</span>
            </div>
            <div className="font-display text-2xl sm:text-3xl text-amber-200 font-bold tracking-tight">
              {analytics.totalAttemptsCount} <span className="text-sm font-sans font-normal text-amber-400/60">pre-órdenes</span>
            </div>
            <div className="mt-2 text-2xs text-amber-400/90 flex items-center justify-between border-t border-amber-500/20 pt-2 font-mono">
              <span>NO FABRICAR</span>
              <span className="text-rose-400">Sin fondos: +{formatCOP(analytics.unconfirmedRevenue)}</span>
            </div>
          </div>

          {/* KPI 4: Ticket Promedio Real */}
          <div className="bg-[#0D2266]/80 backdrop-blur-md border border-gold/25 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-2xs uppercase tracking-widest text-gold font-bold mb-1.5">
              <span>Ticket Promedio</span>
              <span className="text-base">📊</span>
            </div>
            <div className="font-display text-2xl sm:text-3xl text-ivory font-bold tracking-tight">
              {formatCOP(analytics.averageTicket)}
            </div>
            <div className="mt-2 text-2xs text-ivory/60 flex items-center justify-between border-t border-gold/10 pt-2">
              <span>Base: Órdenes con pago verificado</span>
              <span className="font-mono text-emerald-400">Oasis Oficial</span>
            </div>
          </div>
        </section>

        {/* ─── 2. BI CATEGORIES ANALYTICS ─────────────────────────────────── */}
        <section className="bg-[#0D2266]/70 backdrop-blur-md border border-gold/25 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg sm:text-xl text-ivory flex items-center gap-2">
                <span>📈 Desglose BI de Ventas Aprobadas</span>
              </h2>
              <p className="text-2xs text-ivory/60 mt-0.5">
                Facturación real calculada estrictamente sobre órdenes pagadas (excluye carritos abandonados e intentos fallidos).
              </p>
            </div>
            <span className="text-2xs uppercase tracking-widest text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full self-start sm:self-auto font-mono">
              Ventas Consolidadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.categoriesList.map((category) => (
              <div
                key={category.key}
                className="bg-[#0A1B54]/60 p-3.5 rounded-xl border border-gold/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-2xs text-ivory/70 mb-1">
                    <span className="truncate font-medium">{category.icon} {category.tag}</span>
                    <span className="font-mono text-gold font-bold">{category.percentage}%</span>
                  </div>
                  <div className="text-sm font-bold text-ivory font-mono">
                    {formatCOP(category.totalCOP)}
                  </div>
                  <div className="text-2xs text-ivory/50 font-mono mt-0.5">
                    {category.count} {category.count === 1 ? 'pedido' : 'pedidos'}
                  </div>
                </div>
                <div className="w-full bg-[#0D2266] h-1.5 rounded-full overflow-hidden mt-3 border border-gold/20">
                  <div
                    className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(category.percentage, category.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 3. TAB NAVIGATION (COLA DE PRODUCCIÓN VS INTENTOS DE PAGO) ─── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/20 pb-4">
            {/* Main Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-[#08143F] rounded-2xl border border-gold/30">
              {/* Tab 1: Cola de Producción */}
              <button
                onClick={() => {
                  setActiveTab('production')
                  // Enforce strict approved filter by default when switching to production
                  setProductionFilter('approved')
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  activeTab === 'production'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg ring-1 ring-emerald-400/50'
                    : 'text-ivory/70 hover:text-gold hover:bg-[#0D2266]/60'
                }`}
              >
                <span>🏭 Cola de Producción</span>
                <span
                  className={`text-2xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'production'
                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-400/40'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {analytics.approvedReadyCount} listos
                </span>
              </button>

              {/* Tab 2: Intentos de Pago / Carritos Abandonados */}
              <button
                onClick={() => {
                  setActiveTab('attempts')
                  setAttemptsFilter('all_attempts')
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  activeTab === 'attempts'
                    ? 'bg-gradient-to-r from-amber-700/90 to-amber-800 text-amber-100 shadow-lg ring-1 ring-amber-400/50'
                    : 'text-ivory/60 hover:text-amber-300 hover:bg-[#070e24]'
                }`}
              >
                <span>⚠️ Intentos de Pago</span>
                <span
                  className={`text-2xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'attempts'
                      ? 'bg-amber-950 text-amber-200 border border-amber-400/40'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {analytics.totalAttemptsCount}
                </span>
              </button>
            </div>

            {/* Quick Search across active pool */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder={
                  activeTab === 'production'
                    ? 'Buscar en pedidos aprobados...'
                    : 'Buscar en intentos o caídas...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A1B54] border border-gold/30 rounded-xl pl-9 pr-8 py-2.5 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/60 text-xs">🔍</span>
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

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1 CONTENT: COLA DE PRODUCCIÓN (BLINDAJE ZERO-TRUST)             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'production' && (
            <div className="bg-[#0D2266]/70 backdrop-blur-md border border-gold/25 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Trust & Guarantee Banner */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-emerald-300 block">
                      Cola de Fabricación Oficial (Zero-Trust Operacional)
                    </span>
                    <span className="text-2xs text-emerald-200/80">
                      Esta vista contiene <strong>ÚNICAMENTE</strong> órdenes cuyo pago ha sido liquidado y aprobado por Wompi. Cualquier intento sin confirmar está bloqueado de esta lista.
                    </span>
                  </div>
                </div>
                <div className="text-2xs font-mono bg-emerald-900/60 border border-emerald-400/40 px-3 py-1.5 rounded-lg text-emerald-200 whitespace-nowrap">
                  ✓ FONDOS ASEGURADOS
                </div>
              </div>

              {/* Sub-Filters for Production Pipeline */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gold/10">
                <span className="text-2xs uppercase tracking-widest text-gold/80 mr-1 font-semibold">
                  Filtrar Estado:
                </span>
                {[
                  {
                    id: 'approved',
                    label: '✅ Listos para Fabricar (Aprobados)',
                    badge: analytics.approvedReadyCount,
                  },
                  {
                    id: 'production',
                    label: '🏭 En Producción',
                    badge: analytics.counts.production,
                  },
                  {
                    id: 'dispatched',
                    label: '🚚 Despachados',
                    badge: analytics.counts.dispatched,
                  },
                  {
                    id: 'delivered',
                    label: '📦 Entregados',
                    badge: analytics.counts.delivered,
                  },
                  {
                    id: 'all_paid',
                    label: 'Ver Todo el Flujo Pagado',
                    badge: analytics.totalPaidPipeline,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setProductionFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-2xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      productionFilter === f.id
                        ? 'bg-gold text-[#0A1B54] font-bold shadow-md'
                        : 'bg-[#0A1B54]/70 text-ivory/70 hover:text-gold border border-gold/20'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="opacity-70 font-mono">({f.badge})</span>
                  </button>
                ))}

                {/* Category filter */}
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

              {/* Production Table */}
              <div className="overflow-x-auto rounded-xl border border-gold/20 bg-[#0A1B54]/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#08143F] border-b border-gold/20 text-2xs uppercase tracking-wider text-gold font-medium">
                      <th className="py-3.5 px-4">Referencia / Wompi ID</th>
                      <th className="py-3.5 px-4">Fecha Pago</th>
                      <th className="py-3.5 px-4">Cliente & Contacto</th>
                      <th className="py-3.5 px-4">Destino / Entrega</th>
                      <th className="py-3.5 px-4">Categoría BI</th>
                      <th className="py-3.5 px-4 text-right">Total Pagado</th>
                      <th className="py-3.5 px-4 text-center">Estado Taller</th>
                      <th className="py-3.5 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {filteredProductionOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center text-ivory/50">
                          <div className="text-2xl mb-2">📭</div>
                          <div className="text-sm text-ivory/70 font-medium">
                            No hay órdenes en la cola de producción con los filtros seleccionados.
                          </div>
                          <div className="text-2xs text-ivory/40 mt-1">
                            El filtro por defecto muestra estrictamente pagos aprobados.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProductionOrders.map((order) => {
                        const stConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.approved
                        const isExpanded = expandedOrderId === order.id
                        const isUpdating =
                          updatingOrderId === order.id || updatingOrderId === order.wompiReference

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
                                  <div
                                    className="font-mono text-2xs text-emerald-400 mt-0.5 truncate max-w-32"
                                    title={order.wompiTransactionId}
                                  >
                                    Tx: {order.wompiTransactionId}
                                  </div>
                                ) : (
                                  <div className="text-2xs text-ivory/40 mt-0.5">Wompi Validado</div>
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
                                <div
                                  className="text-2xs text-ivory/50 truncate max-w-40 mt-0.5"
                                  title={order.customer?.address}
                                >
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
                                <div className="font-mono font-bold text-emerald-300 text-sm">
                                  {formatCOP(order.total)}
                                </div>
                                <div className="text-2xs text-emerald-400/80 font-mono mt-0.5">
                                  ✓ Cobrado ({order.wompiPaymentMethod || 'Wompi'})
                                </div>
                              </td>

                              {/* Operational Status Selector */}
                              <td className="py-4 px-4 align-top text-center">
                                <div className="relative inline-block w-36">
                                  <select
                                    value={order.status}
                                    disabled={isUpdating}
                                    onChange={(e) =>
                                      handleStatusChange(order.id, e.target.value as OrderStatus)
                                    }
                                    className={`w-full appearance-none rounded-lg py-1.5 pl-7 pr-6 text-2xs font-semibold uppercase tracking-wider border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold ${
                                      stConfig.bg
                                    } ${stConfig.text} ${stConfig.border} disabled:opacity-50`}
                                  >
                                    <option value="approved" className="bg-[#0A1B54] text-emerald-300">
                                      ✅ Aprobado
                                    </option>
                                    <option value="production" className="bg-[#0A1B54] text-blue-300">
                                      🏭 En Producción
                                    </option>
                                    <option value="dispatched" className="bg-[#0A1B54] text-purple-300">
                                      🚚 Despachado
                                    </option>
                                    <option value="delivered" className="bg-[#0A1B54] text-teal-300">
                                      📦 Entregado
                                    </option>
                                    <option value="voided" className="bg-[#0A1B54] text-neutral-400">
                                      🚫 Anulado
                                    </option>
                                  </select>
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
                                  {waUrl ? (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded-lg text-2xs font-medium transition-colors"
                                      title="Confirmar despacho vía WhatsApp"
                                    >
                                      <span>💬</span>
                                      <span className="hidden sm:inline">WhatsApp</span>
                                    </a>
                                  ) : (
                                    <button
                                      disabled
                                      className="opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-500 px-2 py-1.5 rounded-lg text-2xs"
                                    >
                                      💬 WA
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                    className="bg-[#0D2266] hover:bg-[#1A2E6B] border border-gold/30 text-gold px-2 py-1.5 rounded-lg text-2xs transition-colors cursor-pointer"
                                    title="Ver detalle del colchón y medidas"
                                  >
                                    {isExpanded ? '▲' : '▼'}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-[#08143F]/80 border-b border-gold/20">
                                <td colSpan={8} className="p-4 sm:p-6">
                                  <div className="bg-[#0A1B54] rounded-xl p-4 border border-gold/20 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold/10 pb-3 gap-2">
                                      <h4 className="font-display text-base text-gold flex items-center gap-2">
                                        <span>📦 Ficha de Fabricación ({order.items?.length || 0} ítems)</span>
                                      </h4>
                                      <div className="text-2xs text-emerald-300 font-mono">
                                        Flete Pagado: {formatCOP(order.shipping)} | Subtotal: {formatCOP(order.subtotal)}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {(order.items || []).map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 bg-[#0D2266]/60 p-3 rounded-lg border border-gold/15"
                                        >
                                          {item.imageUrl && (
                                            <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-md border border-gold/20">
                                              <Image
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                              />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs text-ivory truncate">
                                              {item.productName}
                                            </div>
                                            <div className="text-2xs text-gold/90 font-semibold">
                                              Medida: {item.size} ({item.dimensions})
                                            </div>
                                            <div className="text-2xs text-ivory/60 font-mono mt-0.5">
                                              Cantidad: <strong>{item.quantity}</strong> unidad(es)
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {order.customer?.notes && (
                                      <div className="bg-gold/5 p-3 rounded-lg border border-gold/20 text-xs">
                                        <span className="text-gold font-semibold">Instrucciones del cliente: </span>
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
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2 CONTENT: INTENTOS DE PAGO (SECCIÓN GRISÁCEA DE ADVERTENCIA)   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'attempts' && (
            <div className="bg-[#070e24] backdrop-blur-md border border-amber-500/35 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Mandatory Operational Warning Banner */}
              <div className="bg-rose-950/70 border-2 border-rose-500/60 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-rose-100">
                <span className="text-3xl animate-pulse">🛑</span>
                <div className="space-y-1">
                  <div className="font-display text-sm sm:text-base font-bold text-rose-200 uppercase tracking-wide">
                    ALERTA OPERATIVA - DINERO NO INGRESADO (ESTRICTAMENTE PROHIBIDO FABRICAR)
                  </div>
                  <div className="text-xs text-rose-200/90 leading-relaxed">
                    Estas órdenes corresponden a <strong>intentos de pago sin confirmar, caídas de pasarela, carritos abandonados o transacciones declinadas</strong>.
                    El dinero <strong>NO HA INGRESADO</strong> a las cuentas de Oasis Colchones. El taller <strong>NO DEBE FABRICAR NI DESPACHAR</strong> ningún colchón de esta lista bajo ninguna circunstancia.
                  </div>
                  <div className="text-2xs text-amber-300 font-mono pt-1">
                    Uso exclusivo: Equipo comercial para contacto y recuperación de carritos vía WhatsApp.
                  </div>
                </div>
              </div>

              {/* Sub-Filters for Attempts */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                <span className="text-2xs uppercase tracking-widest text-amber-400 font-semibold mr-1">
                  Filtrar Causa:
                </span>
                {[
                  {
                    id: 'all_attempts',
                    label: 'Todos los Intentos',
                    badge: analytics.totalAttemptsCount,
                  },
                  {
                    id: 'payment_pending',
                    label: '⏳ Pagos Pendientes / Carritos',
                    badge: analytics.counts.payment_pending + analytics.counts.pending,
                  },
                  {
                    id: 'declined',
                    label: '❌ Declinados por Banco',
                    badge: analytics.counts.declined,
                  },
                  {
                    id: 'error',
                    label: '⚠️ Error de Pasarela',
                    badge: analytics.counts.error,
                  },
                  {
                    id: 'voided',
                    label: '🚫 Anulados',
                    badge: analytics.counts.voided,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAttemptsFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-2xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      attemptsFilter === f.id
                        ? 'bg-amber-600 text-white font-bold shadow-md ring-1 ring-amber-300'
                        : 'bg-[#0A1B54]/50 text-amber-200/70 hover:text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="opacity-70 font-mono">({f.badge})</span>
                  </button>
                ))}

                {/* Category filter */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-2xs uppercase tracking-widest text-amber-400/80">Categoría:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#0A1B54] border border-amber-500/30 rounded-lg px-2.5 py-1 text-2xs text-amber-100 focus:outline-none focus:border-amber-400"
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

              {/* Grayish Table for Unpaid Attempts */}
              <div className="overflow-x-auto rounded-xl border border-amber-500/25 bg-[#050b1a]/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#080f24] border-b border-amber-500/30 text-2xs uppercase tracking-wider text-amber-400 font-medium">
                      <th className="py-3.5 px-4">Referencia / Intento</th>
                      <th className="py-3.5 px-4">Fecha Creación</th>
                      <th className="py-3.5 px-4">Cliente Interesado</th>
                      <th className="py-3.5 px-4">Destino / Contacto</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4 text-right">Valor NO Cobrado</th>
                      <th className="py-3.5 px-4 text-center">Diagnóstico / Alerta</th>
                      <th className="py-3.5 px-4 text-center">Recuperación Comercial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 opacity-90">
                    {filteredAttemptsOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center text-amber-200/50">
                          <div className="text-2xl mb-2">✨</div>
                          <div className="text-sm font-medium">
                            No hay intentos de pago fallidos o pendientes con los filtros seleccionados.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAttemptsOrders.map((order) => {
                        const stConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.payment_pending
                        const isExpanded = expandedOrderId === order.id
                        const isUpdating =
                          updatingOrderId === order.id || updatingOrderId === order.wompiReference

                        const rawPhone = order.customer?.phone || ''
                        const sanitizedPhone = sanitizeColombianPhone(rawPhone)
                        const recoveryMessage = buildAbandonedCartMessage(order)
                        const recoveryUrl = sanitizedPhone
                          ? `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(recoveryMessage)}`
                          : null

                        return (
                          <React.Fragment key={order.id}>
                            <tr className="hover:bg-[#0a1430]/70 transition-colors bg-[#060d22]/40">
                              {/* Ref & Wompi ID */}
                              <td className="py-4 px-4 align-top">
                                <div className="font-mono font-medium text-amber-300 text-xs">
                                  {order.wompiReference}
                                </div>
                                <div className="text-2xs text-rose-400 font-mono mt-0.5 font-bold">
                                  ⚠️ SIN CONFIRMAR
                                </div>
                              </td>

                              {/* Date */}
                              <td className="py-4 px-4 align-top text-ivory/60 whitespace-nowrap text-2xs">
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
                                <div className="font-medium text-ivory/90">
                                  {order.customer?.fullName || 'Cliente no identificado'}
                                </div>
                                <div className="text-2xs text-ivory/50 mt-0.5">
                                  {order.customer?.email}
                                </div>
                                <div className="text-2xs text-amber-300 font-mono mt-0.5">
                                  {rawPhone || 'Sin teléfono'}
                                </div>
                              </td>

                              {/* Destination */}
                              <td className="py-4 px-4 align-top">
                                <div className="text-ivory/80 font-medium">
                                  {order.shippingZone || order.customer?.city || 'No especificada'}
                                </div>
                                <div
                                  className="text-2xs text-ivory/40 truncate max-w-40 mt-0.5"
                                  title={order.customer?.address}
                                >
                                  {order.customer?.address || 'Sin dirección'}
                                </div>
                              </td>

                              {/* BI Category */}
                              <td className="py-4 px-4 align-top">
                                <span className="inline-block bg-[#08122f] border border-amber-500/20 text-amber-200 text-2xs px-2.5 py-1 rounded-full whitespace-nowrap">
                                  {CATEGORY_METADATA[order.biCategory]?.tag || order.biCategory}
                                </span>
                              </td>

                              {/* Total (Marked as NOT received) */}
                              <td className="py-4 px-4 align-top text-right">
                                <div className="font-mono line-through text-ivory/50 text-xs">
                                  {formatCOP(order.total)}
                                </div>
                                <div className="text-2xs font-bold text-rose-400 font-mono mt-0.5">
                                  ❌ $0 COBRADO
                                </div>
                              </td>

                              {/* Warning Badge & Manual Resolution */}
                              <td className="py-4 px-4 align-top text-center">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-md text-2xs font-bold uppercase tracking-wider border ${stConfig.bg} ${stConfig.text} ${stConfig.border}`}
                                  >
                                    {stConfig.warningText || stConfig.label}
                                  </span>

                                  {/* Administrative Manual Approval (if outside bank transfer verified) */}
                                  <div className="pt-1">
                                    <select
                                      value={order.status}
                                      disabled={isUpdating}
                                      onChange={(e) =>
                                        handleStatusChange(order.id, e.target.value as OrderStatus)
                                      }
                                      className="bg-[#050b1a] border border-amber-500/30 text-amber-300 text-2xs rounded px-2 py-0.5 cursor-pointer focus:outline-none"
                                      title="Cambiar estado si se valida pago manual por transferencia bancaria"
                                    >
                                      <option value="payment_pending">⏳ Mantener Pendiente</option>
                                      <option value="approved">✅ Validar y Enviar a Taller (Aprobado)</option>
                                      <option value="declined">❌ Marcar Declinado</option>
                                      <option value="voided">🚫 Anular Intento</option>
                                    </select>
                                  </div>
                                </div>
                              </td>

                              {/* Commercial Action: Cart Recovery WhatsApp */}
                              <td className="py-4 px-4 align-top text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {recoveryUrl ? (
                                    <a
                                      href={recoveryUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-200 px-3 py-1.5 rounded-lg text-2xs font-semibold transition-colors shadow-sm"
                                      title="Enviar mensaje de recuperación de carrito por WhatsApp"
                                    >
                                      <span>💬</span>
                                      <span>Recuperar Carrito</span>
                                    </a>
                                  ) : (
                                    <button
                                      disabled
                                      className="opacity-30 cursor-not-allowed bg-neutral-800 text-neutral-500 px-2.5 py-1.5 rounded-lg text-2xs"
                                    >
                                      Sin Teléfono
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                    className="bg-[#08122f] hover:bg-[#101f4a] border border-amber-500/30 text-amber-300 px-2 py-1.5 rounded-lg text-2xs transition-colors cursor-pointer"
                                    title="Ver detalle del pedido"
                                  >
                                    {isExpanded ? '▲' : '▼'}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-[#040817] border-b border-amber-500/20">
                                <td colSpan={8} className="p-4 sm:p-6">
                                  <div className="bg-[#080f24] rounded-xl p-4 border border-amber-500/30 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2">
                                      <h4 className="font-display text-base text-amber-300 flex items-center gap-2">
                                        <span>🛒 Productos del Intento ({order.items?.length || 0} ítems)</span>
                                      </h4>
                                      <div className="text-2xs text-rose-300 font-mono font-bold">
                                        ESTADO: {stConfig.label.toUpperCase()} — NO EMITIR ORDEN DE TRABAJO
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {(order.items || []).map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 bg-[#050b1a] p-3 rounded-lg border border-amber-500/15 opacity-80"
                                        >
                                          {item.imageUrl && (
                                            <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-md border border-amber-500/20 grayscale">
                                              <Image
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                              />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs text-ivory/80 truncate">
                                              {item.productName}
                                            </div>
                                            <div className="text-2xs text-amber-400/80">
                                              Medida: {item.size} ({item.dimensions})
                                            </div>
                                            <div className="text-2xs text-ivory/50 font-mono mt-0.5">
                                              {item.quantity} × {formatCOP(item.price)} (No pagado)
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {order.customer?.notes && (
                                      <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-500/20 text-xs text-ivory/70">
                                        <span className="text-amber-400 font-semibold">Notas registradas: </span>
                                        <span className="italic">{order.customer.notes}</span>
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
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
