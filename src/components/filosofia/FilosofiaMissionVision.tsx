'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FilosofiaMissionVision() {
  return (
    <section className="relative border-t border-[#0A1B54]/10 px-6 py-24 lg:px-16 lg:py-36 bg-white">
      {/* 1px Grid architectural guide lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-5">
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-[#0A1B54]" />
        <div className="border-r border-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
          >
            Directriz Estratégica & Compromiso
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0A1B54] leading-tight"
          >
            Nuestra Misión y Visión
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 font-body text-xs sm:text-sm text-[#0A1B54]/70 leading-relaxed"
          >
            El propósito que orienta nuestro trabajo diario y el horizonte hacia el que caminamos con paso firme y vocación de servicio.
          </motion.p>
        </div>

        {/* Master Grid: Misión & Visión */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Misión — 6 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="group relative border border-[#0A1B54]/15 bg-[#FAF9F7] p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between transition-all duration-300 hover:border-[#C5A059]"
          >
            <div className="absolute top-0 left-0 h-1 w-20 bg-[#C5A059]" />
            <div>
              <div className="flex items-center justify-between border-b border-[#0A1B54]/10 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059]">
                  01 / Propósito
                </span>
                <span className="font-body text-2xs uppercase tracking-widest text-[#0A1B54]/50">
                  Compromiso Diario
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                Nuestra misión
              </h3>
              <p className="mt-5 font-body text-base text-[#0A1B54]/85 leading-relaxed">
                En Oasis Colchones y Muebles fabricamos colchones confiables y duraderos, mediante procesos transparentes y una mejora continua que nos permite ofrecer alternativas de descanso cada vez más completas a las familias colombianas.
              </p>
            </div>

            <div className="mt-8 border-t border-[#0A1B54]/10 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]">
                  Procesos transparentes
                </span>
                <span className="border border-[#0A1B54]/15 bg-white px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]/70">
                  Mejora continua
                </span>
                <span className="border border-[#0A1B54]/15 bg-white px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]/70">
                  Familias colombianas
                </span>
              </div>
            </div>
          </motion.div>

          {/* Visión — 6 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="group relative border border-[#0A1B54]/15 bg-[#FAF9F7] p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between transition-all duration-300 hover:border-[#C5A059]"
          >
            <div className="absolute top-0 left-0 h-1 w-20 bg-[#0A1B54]/30 group-hover:bg-[#C5A059] transition-colors" />
            <div>
              <div className="flex items-center justify-between border-b border-[#0A1B54]/10 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059]">
                  02 / Horizonte
                </span>
                <span className="font-body text-2xs uppercase tracking-widest text-[#0A1B54]/50">
                  Meta 2036
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                Nuestra visión
              </h3>
              <p className="mt-5 font-body text-base text-[#0A1B54]/85 leading-relaxed">
                Para 2036, consolidarnos como una de las marcas de colchones más confiables y reconocidas de Colombia, destacando por nuestra calidad, innovación y transparencia, con miras a expandirnos hacia el mercado latinoamericano.
              </p>
            </div>

            <div className="mt-8 border-t border-[#0A1B54]/10 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]">
                  Meta 2036
                </span>
                <span className="border border-[#0A1B54]/15 bg-white px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]/70">
                  Calidad e Innovación
                </span>
                <span className="border border-[#0A1B54]/15 bg-white px-2.5 py-1 font-mono text-[11px] text-[#0A1B54]/70">
                  Expansión Latinoamericana
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Strategic Pillars directly derived from mission & vision */}
        <div className="mt-16 border-t border-[#0A1B54]/10 pt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '01',
                title: 'Confiabilidad y Durabilidad',
                desc: 'Diseñamos y fabricamos productos para brindar descanso consistente noche tras noche.',
              },
              {
                number: '02',
                title: 'Procesos Transparentes',
                desc: 'Transparencia que se demuestra desde el interior de cada colchón y en cada interacción.',
              },
              {
                number: '03',
                title: 'Mejora Continua',
                desc: 'Alternativas cada vez más completas, integrando confort y soluciones de descanso modernas.',
              },
              {
                number: '04',
                title: 'Proyección 2036',
                desc: 'Crecimiento fundamentado en el reconocimiento nacional y la futura expansión a Latinoamérica.',
              },
            ].map((pilar, idx) => (
              <motion.div
                key={pilar.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="border border-[#0A1B54]/15 bg-[#FAF9F7] p-6 flex flex-col justify-between hover:border-[#C5A059] transition-colors"
              >
                <div>
                  <span className="font-mono text-xl font-light text-[#C5A059]">
                    {pilar.number}
                  </span>
                  <h4 className="mt-3 font-display text-base font-normal text-[#0A1B54]">
                    {pilar.title}
                  </h4>
                  <p className="mt-2 font-body text-xs text-[#0A1B54]/70 leading-relaxed">
                    {pilar.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#0A1B54]/10 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#C5A059]" />
                  <span className="font-body text-[10px] uppercase tracking-wider text-[#0A1B54]/50">
                    Oasis Colchones y Muebles
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
