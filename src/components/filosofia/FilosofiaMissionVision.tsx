'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FilosofiaMissionVision() {
  return (
    <section className="relative border-t border-white/10 px-6 py-24 lg:px-16 lg:py-36 bg-[#07133B]/50">
      {/* 1px Grid architectural guide lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-5">
        <div className="border-r border-white" />
        <div className="border-r border-white" />
        <div className="border-r border-white" />
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
            Directriz Corporativa & Marco Estratégico
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight"
          >
            Misión, Visión y Fundamentos de Manufactura.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 font-body text-xs sm:text-sm text-white/60 leading-relaxed"
          >
            Nuestros principios no son literatura promocional. Son las normas de tolerancia milimétrica, densidad de poliuretano y calibres de acero que rigen cada turno en planta.
          </motion.p>
        </div>

        {/* Asymmetric Master Grid: Misión & Visión */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Misión — 6 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="group relative border border-white/10 bg-[#0A1B54]/60 p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between transition-colors hover:border-[#C5A059]/40"
          >
            <div className="absolute top-0 left-0 h-1 w-16 bg-[#C5A059]" />
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059]">
                  01 / Propósito Operacional
                </span>
                <span className="font-body text-2xs uppercase tracking-widest text-white/40">
                  Compromiso Diario
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl sm:text-3xl font-normal text-white">
                Nuestra Misión
              </h3>
              <p className="mt-4 font-body text-sm text-white/80 leading-relaxed">
                Diseñar y manufacturar sistemas de descanso de alta ingeniería biomecánica en Bogotá, eliminando cadenas de intermediarios comerciales y sobrecostos de vitrina retail para entregar al usuario final colchones con especificación técnica transparente, materiales de densidad certificada y durabilidad comprobada.
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-mono text-2xs text-[#C5A059] uppercase tracking-wider">
                Impacto Real: Densidad real sin rellenos calcáreos ni sobreprecios comerciales.
              </p>
            </div>
          </motion.div>

          {/* Visión — 6 Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="group relative border border-white/10 bg-[#0A1B54]/60 p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between transition-colors hover:border-[#C5A059]/40"
          >
            <div className="absolute top-0 left-0 h-1 w-16 bg-white/40 group-hover:bg-[#C5A059] transition-colors" />
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059]">
                  02 / Horizonte Industrial
                </span>
                <span className="font-body text-2xs uppercase tracking-widest text-white/40">
                  Meta 2030
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl sm:text-3xl font-normal text-white">
                Nuestra Visión
              </h3>
              <p className="mt-4 font-body text-sm text-white/80 leading-relaxed">
                Consolidar a Oasis Colchones como el referente nacional de transparencia en la industria del descanso, demostrando que la durabilidad, el rigor biomecánico y el precio justo son plenamente compatibles cuando se sustituye el marketing especulativo por manufactura directa y trazabilidad abierta de componentes.
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-mono text-2xs text-white/50 uppercase tracking-wider">
                Dirección Estratégica: Desplazar el estándar de obsolescencia rápida en Colombia.
              </p>
            </div>
          </motion.div>
        </div>

        {/* 4 Pilares de Valor Corporativo */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
            <div>
              <span className="font-mono text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
                03 / Código Ético de Planta
              </span>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                Nuestros Cuatro Valores No Negociables
              </h3>
            </div>
            <p className="font-body text-2xs uppercase tracking-wider text-white/40 max-w-xs">
              Aplicados en cada proceso desde la recepción de bobinas de alambre hasta la costura final.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '01',
                title: 'Honestidad Constructiva',
                spec: 'Trazabilidad de Densidades',
                body: 'Declaramos la ficha técnica verídica de cada núcleo: espumas HR-40 y HD-45 sin aditivos de carga pesada ni carbonato de calcio que falseen el peso.',
              },
              {
                number: '02',
                title: 'Precio Justo de Fábrica',
                spec: 'Cero Margen de Retail',
                body: 'No transferimos cánones de arrendamiento en centros comerciales ni comisiones de vendedores. El precio refleja estrictamente materiales y mano de obra calificada.',
              },
              {
                number: '03',
                title: 'Rigor Biomecánico',
                spec: '100,000 Ciclos Dinámicos',
                body: 'Sometemos nuestras matrices a ensayos de compresión mecánica continua. Si una fórmula no retiene el 95% de su cota tras fatiga cíclica, no sale a producción.',
              },
              {
                number: '04',
                title: 'Responsabilidad Directa',
                spec: 'Garantía 10 a 15 Años',
                body: 'Respondemos nosotros mismos. Sin pólizas delegadas a aseguradoras terceras. El mismo equipo de planta que armó tu colchón atiende cualquier garantía técnica.',
              },
            ].map((value, i) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-white/10 bg-[#0A1B54]/40 p-6 flex flex-col justify-between hover:border-[#C5A059]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-light text-[#C5A059]">
                      {value.number}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-0.5">
                      {value.spec}
                    </span>
                  </div>
                  <h4 className="mt-4 font-display text-lg font-normal text-white">
                    {value.title}
                  </h4>
                  <p className="mt-3 font-body text-xs text-white/70 leading-relaxed">
                    {value.body}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#C5A059]" />
                  <span className="font-body text-[10px] uppercase tracking-wider text-white/40">
                    Norma Interna Oasis
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
