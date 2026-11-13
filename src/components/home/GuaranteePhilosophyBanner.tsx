'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function GuaranteePhilosophyBanner() {
  return (
    <section className="relative border-t border-[#0A1B54]/10 px-6 py-20 lg:px-16 lg:py-28 overflow-hidden bg-white">
      {/* Precision 1px architectural column lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-30">
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-[#0A1B54]/5" />
        <div className="border-r border-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Architectural Quiet Luxury Framing: Tension Espacial Activa */}
        <div className="border border-[#0A1B54]/15 bg-[#FAF9F7] p-8 sm:p-12 lg:p-16 relative">
          
          {/* Subtle Top-Left Accent Notch */}
          <div className="absolute -top-px left-8 sm:left-16 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column: Thesis & Direct Guarantee (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
                <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-semibold">
                  Garantía Industrial Directa & Origen Bogotá
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0A1B54] leading-tight"
              >
                Garantía Real de Fábrica.<br />
                <span className="italic text-[#C5A059] font-light">Cero letra pequeña.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-body text-xs sm:text-sm text-[#0A1B54]/75 max-w-xl leading-relaxed"
              >
                En Oasis no derivamos las garantías a aseguradoras externas ni intermediarios comerciales. Cada colchón manufacturado en nuestra nave de Bogotá cuenta con respaldo directo de fábrica según la ficha técnica de cada referencia: respondemos con peritaje e intervención técnica directa de planta.
              </motion.p>

              {/* Action Links */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6"
              >
                <Link
                  href="/nosotros"
                  className="group inline-flex items-center gap-3 border border-[#0A1B54] bg-[#0A1B54] px-6 py-3.5 font-body text-xs uppercase tracking-widest text-white font-medium transition-all duration-300 hover:bg-[#C5A059] hover:border-[#C5A059]"
                >
                  Sobre Nosotros
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M1 6h10M6 1l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/legales"
                  className="font-body text-xs uppercase tracking-widest text-[#0A1B54]/60 hover:text-[#0A1B54] transition-colors underline underline-offset-4 decoration-[#0A1B54]/20 hover:decoration-[#C5A059]"
                >
                  Compromisos y Garantía de Manufactura →
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Key Industrial Certifications (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              {[
                {
                  metric: '1 a 8',
                  unit: 'AÑOS',
                  title: 'Garantía Estructural de Fábrica',
                  desc: 'Válida sobre deformación de resortes o fatiga prematura de núcleos de espuma según ficha técnica oficial.',
                },
                {
                  metric: '100%',
                  unit: 'BOGOTÁ',
                  title: 'Manufactura Directa en Planta',
                  desc: 'Procesos controlados de espumación y ensamble de resortes Bonell y Pocket en nuestra sede capitalina.',
                },
                {
                  metric: '0%',
                  unit: 'COSTO',
                  title: 'Peritaje Directo en Bogotá',
                  desc: 'Inspección técnica en tu domicilio por personal capacitado de nuestra planta de producción.',
                },
              ].map((cert, i) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  className="border border-[#0A1B54]/10 bg-white p-5 hover:border-[#C5A059]/40 transition-colors shadow-2xs"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-normal text-[#0A1B54]">
                      {cert.metric}
                    </span>
                    <span className="font-mono text-2xs uppercase tracking-wider text-[#C5A059] font-semibold">
                      {cert.unit}
                    </span>
                    <span className="h-px flex-1 bg-[#0A1B54]/10 ml-2" />
                  </div>
                  <h3 className="mt-1 font-body text-xs font-semibold text-[#0A1B54]">
                    {cert.title}
                  </h3>
                  <p className="mt-1 font-body text-2xs text-[#0A1B54]/70 leading-relaxed">
                    {cert.desc}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
