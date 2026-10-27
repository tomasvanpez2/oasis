'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/fabrica', label: 'Nuestra Fábrica' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 30)
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 lg:px-16 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'border-b border-white/10 bg-[#0A1B54]/95 py-4 backdrop-blur-md'
            : 'py-7 bg-gradient-to-b from-[#0A1B54] via-[#0A1B54]/80 to-transparent'
        }`}
      >
        {/* Brand / Logo */}
        <Link href="/" className="group flex flex-col focus:outline-none">
          <span className="font-display text-2xl font-normal leading-none text-white tracking-tight">
            Oasis
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-[#C5A059] transition-colors group-hover:text-white">
            Colchones
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-10 md:flex" aria-label="Navegación principal">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`relative font-body text-xs uppercase tracking-[0.18em] transition-colors duration-200 py-1 ${
                  isActive ? 'text-[#C5A059] font-medium' : 'text-white/60 hover:text-white'
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
        <div className="flex items-center gap-5 sm:gap-6">
          <button
            onClick={toggleCart}
            className="group relative flex items-center gap-2.5 border border-white/20 bg-white/5 px-4 py-2 font-body text-xs uppercase tracking-widest text-white transition-all duration-200 hover:border-[#C5A059] hover:bg-[#C5A059]/10"
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
            <span className="hidden sm:inline font-body text-2xs uppercase tracking-wider text-white/70">
              Carrito
            </span>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059] font-body text-[10px] font-bold text-[#0A1B54]"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center border border-white/20 text-white md:hidden hover:border-[#C5A059]"
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
            className="fixed inset-x-0 top-[65px] z-30 border-b border-white/10 bg-[#0A1B54] px-6 py-8 md:hidden"
          >
            <nav className="flex flex-col space-y-6">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-display text-2xl tracking-tight transition-colors ${
                      isActive ? 'text-[#C5A059]' : 'text-white hover:text-[#C5A059]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="font-body text-2xs uppercase tracking-widest text-white/40">
                  Fábrica directa Bogotá
                </span>
                <span className="font-body text-2xs text-[#C5A059]">
                  13 referencias técnicas
                </span>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
