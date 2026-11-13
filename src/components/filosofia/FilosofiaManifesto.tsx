'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FilosofiaManifesto() {
  return (
    <section className="relative border-t border-[#0A1B54]/10 px-6 py-24 lg:px-16 lg:py-32 bg-[#FAF9F7]">
      {/* Background architectural guides */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-5">
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: Big Philosophy Statement */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Transparencia Constructiva
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-3 font-display text-3xl sm:text-5xl font-normal text-[#0A1B54] leading-tight"
            >
              La confianza se construye con hechos y la transparencia se demuestra desde el interior.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 border-l-2 border-[#C5A059] pl-6 py-2"
            >
              <p className="font-display italic text-xl sm:text-2xl text-[#0A1B54]/90 leading-relaxed font-light">
                «Por eso, fabricamos nuestros colchones con materias primas nobles y una ingeniería de capas honesta que garantiza un descanso reparador y duradero.»
              </p>
            </motion.div>
          </div>

          {/* Right Column: 3 Real Value Cards */}
          <div className="lg:col-span-5 space-y-5 lg:border-l lg:border-[#0A1B54]/10 lg:pl-10">
            {[
              {
                number: '01',
                title: 'Hechos Antes que Promesas',
                desc: 'La confianza no surge de palabras bonitas; nace de la constancia, el cumplimiento y el compromiso diario con cada familia colombiana.',
              },
              {
                number: '02',
                title: 'Transparencia desde el Interior',
                desc: 'No escondemos nada: facilitamos la verificación de nuestras estructuras y materiales para que sepas exactamente sobre qué estás descansando.',
              },
              {
                number: '03',
                title: 'Materiales de Calidad y Durabilidad',
                desc: 'Seleccionamos cada insumo y cuidamos cada proceso de confección para entregar colchones y muebles verdaderamente duraderos.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="group border border-[#0A1B54]/15 bg-white p-6 transition-all duration-300 hover:border-[#C5A059]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#C5A059]">
                    {card.number}
                  </span>
                  <div className="h-px flex-1 bg-[#0A1B54]/10 group-hover:bg-[#C5A059]/30 transition-colors" />
                </div>
                <h3 className="mt-3 font-display text-lg font-normal text-[#0A1B54]">
                  {card.title}
                </h3>
                <p className="mt-2 font-body text-xs sm:text-sm text-[#0A1B54]/70 leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
