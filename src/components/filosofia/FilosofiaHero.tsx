'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

export function FilosofiaHero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background industrial visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="film-grain absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=85"
          alt="Línea de confección industrial Oasis Colchones en Bogotá"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B54] via-[#0A1B54]/85 to-[#0A1B54]/60" />
      </motion.div>

      {/* Precision 1px grid guides */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-10">
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 flex min-h-[70vh] flex-col justify-end">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
              <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                Manufactura Directa — Bogotá, Colombia
              </span>
            </span>
          </motion.div>

          <div className="mt-6">
            <TextSplitReveal
              text="Nuestra Filosofía."
              as="h1"
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-[0.95] tracking-tight"
              delay={0.15}
              stagger={0.06}
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-display italic text-2xl sm:text-3xl font-light text-[#C5A059]"
            >
              Hacer el colchón correcto, no el más rentable para el intermediario.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-body text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed"
          >
            En un mercado saturado de promesas abstractas y márgenes de retail inflados hasta un 350%, Oasis opera como un taller de ingeniería industrial abierto. Confeccionamos en nuestra planta de Bogotá cada pieza bajo normas técnicas medibles: calibres de acero templado, látex Dunlop de alta resiliencia y espumas de densidad certificada.
          </motion.p>
        </div>

        {/* Industrial Metrics Footer Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/15 pt-8"
        >
          {[
            { value: '2,400 m²', label: 'Nave de Producción' },
            { value: '38', label: 'Especialistas de Planta' },
            { value: '10–15 Años', label: 'Garantía Estructural Real' },
            { value: '0%', label: 'Intermediación Comercial' },
          ].map(({ value, label }) => (
            <div key={label} className="border-r border-white/10 pr-4 last:border-r-0">
              <p className="font-display text-2xl sm:text-3xl font-normal text-white">{value}</p>
              <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/50">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
