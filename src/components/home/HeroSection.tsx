'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'
import { TechnicalDiagram } from './TechnicalDiagram'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-[#0A1B54]/10"
    >
      {/* Precision 1px Architectural Column Grid Lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-5 opacity-40">
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Asymmetric 5-Column to 7-Column Master Grid */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* ── COLUMNA IZQUIERDA: EDITORIAL QUIET LUXURY ── */}
          <div className="flex flex-col justify-center lg:col-span-5 lg:sticky lg:top-32">
            {/* Direct Factory Quality Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2.5 border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
                <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                  Manufactura Directa — Bogotá, Colombia
                </span>
              </span>
            </motion.div>

            {/* Display Typography with Text-Splitting */}
            <div className="mt-6">
              <TextSplitReveal
                text="Ingeniería de Descanso."
                as="h1"
                className="font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-[0.93] tracking-tight text-[#0A1B54]"
                delay={0.1}
                stagger={0.06}
              />
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 font-display italic text-2xl sm:text-3xl font-light text-[#C5A059]"
              >
                Sin intermediarios. Sin margen de retail.
              </motion.p>
            </div>

            {/* Strict Hero Copy from Scope Item #2 */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-body text-sm sm:text-base text-[#0A1B54]/80 max-w-lg leading-relaxed"
            >
              Te damos la bienvenida a Oasis. Explora nuestra variedad de productos, conoce sus características y encuentra la opción ideal para disfrutar de un mejor descanso.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
            >
              <Link
                href="/catalogo"
                className="group flex items-center gap-3 border border-[#0A1B54] bg-[#0A1B54] px-7 py-4 font-body text-xs uppercase tracking-widest text-white font-semibold transition-all duration-300 hover:bg-[#C5A059] hover:border-[#C5A059]"
              >
                Ve nuestro catálogo
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/nosotros"
                className="border border-[#0A1B54]/20 bg-[#0A1B54]/5 px-6 py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] transition-all duration-300 hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                Nosotros
              </Link>
            </motion.div>

            {/* Industrial Metrics: Strict 1px borders */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85 }}
              className="mt-12 grid grid-cols-3 gap-4 border-t border-[#0A1B54]/10 pt-8"
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">20+</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50">
                  Años manufactura
                </p>
              </div>
              <div className="border-l border-[#0A1B54]/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#C5A059]">100%</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50">
                  Fábrica directa
                </p>
              </div>
              <div className="border-l border-[#0A1B54]/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">Bogotá</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50">
                  Origen y Planta
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── COLUMNA DERECHA: DIAGRAMA TÉCNICO INTERNO ── */}
          <div className="flex flex-col items-center lg:col-span-7 w-full">
            <TechnicalDiagram />
          </div>

        </div>
      </div>
    </section>
  )
}
