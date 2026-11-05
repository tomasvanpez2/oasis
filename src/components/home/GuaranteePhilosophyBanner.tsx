'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function GuaranteePhilosophyBanner() {
  return (
    <section className="relative border-t border-white/10 px-6 py-20 lg:px-16 lg:py-28 overflow-hidden bg-gradient-to-b from-[#0A1B54] via-[#07133B] to-[#0A1B54]">
      {/* Precision 1px architectural column lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-5">
        <div className="border-r border-white" />
        <div className="border-r border-white" />
        <div className="border-r border-white" />
        <div className="border-r border-transparent" />
      </div>

      {/* Atmospheric subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-full max-w-4xl rounded-full bg-[#C5A059]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Architectural Quiet Luxury Framing: Tension Espacial Activa */}
        <div className="border border-white/15 bg-[#07133B]/40 p-8 sm:p-12 lg:p-16 backdrop-blur-sm relative">
          
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
                <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]">
                  Garantía Industrial Directa & Filosofía de Planta
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight"
              >
                15 Años de Ingeniería.<br />
                <span className="italic text-[#C5A059] font-light">Cero letra pequeña.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-body text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed"
              >
                En Oasis no derivamos las garantías a aseguradoras externas ni intermediarios comerciales. Cada colchón manufacturado en nuestra nave de Bogotá cuenta con respaldo directo de fábrica: si el núcleo presenta una pérdida de altura superior a 2.5 cm, respondemos con peritaje e intervención técnica de planta.
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
                  href="/filosofia"
                  className="group inline-flex items-center gap-3 border border-[#C5A059] bg-[#C5A059]/15 px-6 py-3.5 font-body text-xs uppercase tracking-widest text-[#C5A059] font-medium transition-all duration-300 hover:bg-[#C5A059] hover:text-[#0A1B54]"
                >
                  Conocer Nuestra Filosofía
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
                  className="font-body text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#C5A059]"
                >
                  Ver Protocolo de Garantía Legal →
                </Link>
              </motion.div>
            </div>

            {/* Right Column: 3 Architectural Micro-Panels (5 Columns) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              
              {/* Panel 1 */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="border border-white/10 bg-[#0A1B54]/60 p-5 hover:border-[#C5A059]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#C5A059] font-bold">10 a 15 Años</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">Certificado</span>
                </div>
                <h3 className="mt-2 font-display text-base text-white">Cobertura Estructural Total</h3>
                <p className="mt-1 font-body text-xs text-white/60 leading-relaxed">
                  Garantía contra deformación permanente y fatiga de resortes ensacados independientes.
                </p>
              </motion.div>

              {/* Panel 2 */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border border-white/10 bg-[#0A1B54]/60 p-5 hover:border-[#C5A059]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#C5A059] font-bold">100,000 Ciclos</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">Ensayo Mecánico</span>
                </div>
                <h3 className="mt-2 font-display text-base text-white">Prueba Dinámica de Fatiga</h3>
                <p className="mt-1 font-body text-xs text-white/60 leading-relaxed">
                  Rodillo robotizado de 140 kg verifica la cohesión de las espumas HR antes del despacho.
                </p>
              </motion.div>

              {/* Panel 3 */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="border border-white/10 bg-[#0A1B54]/60 p-5 hover:border-[#C5A059]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#C5A059] font-bold">Sin Intermediarios</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">Planta Bogotá</span>
                </div>
                <h3 className="mt-2 font-display text-base text-white">Despacho de Origen Directo</h3>
                <p className="mt-1 font-body text-xs text-white/60 leading-relaxed">
                  Embalaje termoplástico termosellado en nave industrial. Cero bodegas intermedias.
                </p>
              </motion.div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
