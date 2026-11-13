'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

export function FilosofiaHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-16 bg-white">
      {/* Background architectural image with quiet luxury overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="film-grain absolute inset-0 pointer-events-none"
      >
        <Image
          src="/images/products/colchon-pillow-top-original/ambientada.webp"
          alt="Oasis Colchones y Muebles - Confección artesanal y calidad transparente"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
      </motion.div>

      {/* Precision 1px grid guides */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-10">
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 flex flex-col justify-end pt-4 lg:pt-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
              <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#0A1B54] font-medium">
                Trayectoria desde 1998 — Raíces Boyacenses • Bogotá
              </span>
            </span>
          </motion.div>

          <div className="mt-6">
            <TextSplitReveal
              text="Nosotros."
              as="h1"
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-[#0A1B54] leading-[0.95] tracking-tight"
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
              className="font-body text-sm sm:text-base text-[#0A1B54]/85 leading-relaxed"
            >
              Oasis Colchones es una marca con trayectoria desde 1998, fundada por una familia de raíces boyacenses con centro de manufactura en <strong className="font-semibold text-[#0A1B54]">Bogotá</strong>. Nuestros comienzos estuvieron marcados por el trabajo y la perseverancia: recorríamos pueblos en un camión, llevando nuestros colchones y persiguiendo un sueño sencillo: <strong className="font-semibold text-[#0A1B54]">poner a dormir bien a todos los colombianos.</strong>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-sm sm:text-base text-[#0A1B54]/75 leading-relaxed"
            >
              Hoy evolucionamos hacia una nueva etapa como <strong className="font-semibold text-[#0A1B54]">Oasis Colchones y Muebles</strong>, renovando nuestra imagen y ampliando nuestros horizontes desde Bogotá, sin perder la esencia familiar que nos ha acompañado desde el comienzo.
            </motion.p>
          </div>
        </div>

        {/* Historical and Strategic Pillars Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#0A1B54]/15 pt-8"
        >
          {[
            { value: '1998', label: 'Año de Fundación', desc: 'Raíces boyacenses y vocación familiar' },
            { value: 'Bogotá', label: 'Origen de la Empresa', desc: 'Sede y manufactura directa en la capital' },
            { value: 'Pueblo a Pueblo', label: 'Nuestros Inicios', desc: 'En un camión llevando descanso a Colombia' },
            { value: 'Nueva Etapa', label: 'Colchones y Muebles', desc: 'Renovación y expansión de horizontes' },
          ].map(({ value, label, desc }) => (
            <div key={label} className="border-r border-[#0A1B54]/10 pr-4 last:border-r-0">
              <p className="font-display text-xl sm:text-2xl font-normal text-[#0A1B54]">{value}</p>
              <p className="mt-1 font-body text-2xs uppercase tracking-wider text-[#C5A059] font-medium">
                {label}
              </p>
              <p className="mt-1 font-body text-2xs text-[#0A1B54]/60 leading-snug">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
