'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/legales', label: 'Legales' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const totalItems = mounted ? getTotalItems() : 0

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 lg:px-16 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'border-b border-[#0A1B54]/10 bg-white/95 py-4 lg:py-5 backdrop-blur-md shadow-[0_4px_24px_rgba(10,27,84,0.06)]'
            : 'py-6 lg:py-7 bg-white/90 border-b border-[#0A1B54]/10 backdrop-blur-sm'
        }`}
      >
        {/* Brand / Logo with ample breathing room */}
        <Link href="/" className="group flex items-center gap-3.5 sm:gap-4 focus:outline-none">
          <div className="relative h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Oasis Colchones & Muebles"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl sm:text-3xl font-medium leading-none text-[#0A1B54] tracking-tight">
                OASIS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
            </div>
            <span className="font-body text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#C5A059] font-medium transition-colors group-hover:text-[#0A1B54] mt-1">
              Colchones & Muebles
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href || (href === '/nosotros' && pathname === '/filosofia')
            return (
              <Link
                key={href}
                href={href}
                className={`relative font-body text-xs uppercase tracking-[0.18em] transition-colors duration-200 py-1 ${
                  isActive ? 'text-[#C5A059] font-medium' : 'text-[#0A1B54]/70 hover:text-[#0A1B54]'
                }`}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="header-active-pill"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-[#C5A059]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions: Cart & Mobile Menu Trigger */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={toggleCart}
            type="button"
            className="group relative flex items-center gap-2.5 border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-4 py-2 font-body text-xs uppercase tracking-widest text-[#0A1B54] transition-all duration-200 hover:border-[#C5A059] hover:bg-[#C5A059]/10"
            aria-label={`Carrito de compras con ${totalItems} productos`}
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" className="transition-transform group-hover:scale-110">
              <path
                d="M1 1h2.5l1.8 9.5h9.2l1.5-7H4.8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.5" cy="15.5" r="1.2" fill="currentColor" />
              <circle cx="13.5" cy="15.5" r="1.2" fill="currentColor" />
            </svg>
            <span className="hidden sm:inline font-body text-2xs uppercase tracking-wider text-[#0A1B54]/80">
              Carrito
            </span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A1B54] font-body text-[10px] font-bold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center border border-[#0A1B54]/20 text-[#0A1B54] md:hidden hover:border-[#C5A059]"
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {mobileMenuOpen ? (
                <path d="M3 3l12 12M3 15L15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[65px] z-30 border-b border-[#0A1B54]/10 bg-white px-6 py-8 md:hidden shadow-xl"
          >
            <nav className="flex flex-col space-y-6">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || (href === '/nosotros' && pathname === '/filosofia')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-display text-2xl tracking-tight transition-colors ${
                      isActive ? 'text-[#C5A059]' : 'text-[#0A1B54] hover:text-[#C5A059]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-[#0A1B54]/10 flex items-center justify-between">
                <span className="font-body text-2xs uppercase tracking-widest text-[#0A1B54]/50">
                  Fábrica directa Bogotá
                </span>
                <Link
                  href="/catalogo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-body text-2xs text-[#C5A059] hover:underline"
                >
                  Ve nuestro catálogo →
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
