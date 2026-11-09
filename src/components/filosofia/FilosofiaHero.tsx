'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

export function FilosofiaHero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background visual overlay with brand warmth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="film-grain absolute inset-0"
      >
        <Image
          src="/images/products/colchon-pillow-top-original/foto-1.webp"
          alt="Oasis Colchones y Muebles - Confección artesanal y calidad transparente"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B54] via-[#0A1B54]/90 to-[#0A1B54]/75" />
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
                Trayectoria desde 1998 — Raíces Boyacenses
              </span>
            </span>
          </motion.div>

          <div className="mt-6">
            <TextSplitReveal
              text="Quiénes somos"
              as="h1"
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-[0.95] tracking-tight"
              delay={0.15}
              stagger={0.06}
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 font-display italic text-2xl sm:text-3xl font-light text-[#C5A059]"
            >
              En Oasis, la calidad no se promete, se muestra.
            </motion.p>
          </div>

          <div className="mt-6 space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-sm sm:text-base text-white/90 leading-relaxed"
            >
              Oasis Colchones es una marca con trayectoria desde 1998, fundada por una familia de raíces boyacenses. Nuestros comienzos estuvieron marcados por el trabajo y la perseverancia: recorríamos pueblos en un camión, llevando nuestros colchones y persiguiendo un sueño sencillo: poner a dormir bien a todos los colombianos.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-sm sm:text-base text-white/80 leading-relaxed"
            >
              Hoy evolucionamos hacia una nueva etapa como <strong className="font-semibold text-white">Oasis Colchones y Muebles</strong>, renovando nuestra imagen y ampliando nuestros horizontes, sin perder la esencia familiar que nos ha acompañado desde el comienzo.
            </motion.p>
          </div>
        </div>

        {/* Historical and Strategic Pillars Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/15 pt-8"
        >
          {[
            { value: '1998', label: 'Año de Fundación', desc: 'Raíces boyacenses y vocación de servicio' },
            { value: 'Pueblo a Pueblo', label: 'Nuestros Inicios', desc: 'En un camión llevando descanso a Colombia' },
            { value: 'Esencia Familiar', label: 'Valores Intactos', desc: 'El corazón y cercanía de siempre' },
            { value: 'Nueva Etapa', label: 'Colchones y Muebles', desc: 'Renovación y expansión de horizontes' },
          ].map(({ value, label, desc }) => (
            <div key={label} className="border-r border-white/10 pr-4 last:border-r-0">
              <p className="font-display text-xl sm:text-2xl font-normal text-white">{value}</p>
              <p className="mt-1 font-body text-2xs uppercase tracking-wider text-[#C5A059] font-medium">
                {label}
              </p>
              <p className="mt-1 font-body text-2xs text-white/50 leading-snug">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
