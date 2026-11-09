'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FilosofiaManifesto() {
  return (
    <section className="relative border-t border-white/10 px-6 py-24 lg:px-16 lg:py-32 bg-[#0A1B54]">
      {/* Background architectural guides */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-5">
        <div className="border-r border-white" />
        <div className="border-r border-white" />
        <div className="border-r border-white" />
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
              className="mt-3 font-display text-3xl sm:text-5xl font-normal text-white leading-tight"
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
              <p className="font-display italic text-xl sm:text-2xl text-white/95 leading-relaxed font-light">
                «Por eso, fabricamos nuestros colchones con materiales de calidad y estructuras que puedes ver por dentro.»
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 inline-block border border-[#C5A059]/40 bg-[#C5A059]/10 px-5 py-3"
            >
              <p className="font-display text-lg sm:text-xl font-medium text-[#C5A059] tracking-wide">
                En Oasis, la calidad no se promete, se muestra.
              </p>
            </motion.div>
          </div>

          {/* Right Column: 3 Real Value Cards */}
          <div className="lg:col-span-5 space-y-5 lg:border-l lg:border-white/10 lg:pl-10">
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
                className="group border border-white/10 bg-[#07133B]/50 p-6 transition-all duration-300 hover:border-[#C5A059]/50 hover:bg-[#07133B]/80"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#C5A059]">
                    {card.number}
                  </span>
                  <div className="h-px flex-1 bg-white/10 group-hover:bg-[#C5A059]/30 transition-colors" />
                </div>
                <h3 className="mt-3 font-display text-lg font-normal text-white">
                  {card.title}
                </h3>
                <p className="mt-2 font-body text-xs sm:text-sm text-white/70 leading-relaxed">
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
