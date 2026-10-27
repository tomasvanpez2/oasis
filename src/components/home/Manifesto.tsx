'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

export function Manifesto() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 px-6 lg:px-16 py-24 lg:py-36">
      {/* Background architectural watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 font-display text-[18vw] font-normal leading-none text-white/[0.02] select-none"
      >
        Ingeniería
      </div>

      <div className="relative z-10 max-w-3xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
        >
          Manifiesto Industrial
        </motion.p>

        <div className="mt-4">
          <TextSplitReveal
            text="El descanso biomecánico no debería ser un lujo."
            as="h2"
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight text-white"
            delay={0.1}
            stagger={0.05}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 font-body text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl"
        >
          En Colombia, las grandes superficies comerciales multiplican hasta por 3.5× el costo de fabricación de un colchón para cubrir arriendos en centros comerciales y comisiones de venta. En Oasis rompemos la cadena: fabricamos en Bogotá y despachamos a tu hogar con materiales de alta densidad, resortes ensacados independientes y telas con certificación térmica real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10"
        >
          <Link
            href="/fabrica"
            className="group inline-flex items-center gap-3 border-b border-[#C5A059] pb-2 font-body text-xs uppercase tracking-widest text-white transition-colors hover:text-[#C5A059]"
          >
            Visitar Nuestra Fábrica
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
