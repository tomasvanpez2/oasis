'use client'

import React from 'react'
import { motion } from 'framer-motion'

const MANIFESTO_LINES = [
  'El descanso biomecánico no es un artificio publicitario.',
  'Es el resultado exacto de la física de materiales.',
  'No pagamos alquileres en centros comerciales de lujo.',
  'Invertimos ese margen en mayor gramaje de espuma y resortes de acero continuo.',
  'Nuestra reputación se sostiene en 15 años de soporte sin deformación.',
]

export function FilosofiaManifesto() {
  return (
    <section className="relative border-t border-white/10 px-6 py-24 lg:px-16 lg:py-36 bg-[#0A1B54]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Left Column: Asymmetric Typography */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Manifiesto de Manufactura
            </motion.p>

            <div className="mt-8 space-y-4">
              {MANIFESTO_LINES.map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.p
                    className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal italic text-white leading-snug"
                    initial={{ y: '100%', opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    «{line}»
                  </motion.p>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-12 border-l border-[#C5A059] pl-6 py-1"
            >
              <p className="font-body text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
                Al comprar directo en nuestra fábrica en Bogotá, el 100% de tu pago remunera mano de obra técnica y materiales de alta especificación. Cero comisiones a vendedores de piso, cero márgenes de distribución intermediada.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Industrial Rigor Cards */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-white/10 lg:pl-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Compromisos Verificables
            </motion.p>

            {[
              {
                title: 'Densidad Declarada vs. Densidad Real',
                body: 'No usamos denominaciones ambiguas como "ultra firme". Especificamos densidad métrica: 40 kg/m³, 45 kg/m³ y 60 kg/m³, auditables en laboratorio.',
              },
              {
                title: 'Alambre de Acero al Carbono Templado',
                body: 'Cada resorte ensacado se embute en tela no tejida de polipropileno con tratamiento térmico para conservar la tensión elástica durante más de una década.',
              },
              {
                title: 'Despacho Asegurado en Vehículo Propio',
                body: 'En Bogotá y Sabana despachamos con flota propia y cuadrilla entrenada. En el resto del país, operamos bajo convenio logístico con Coordinadora Mercantil.',
              },
              {
                title: 'Garantía Estructural sin Trampas',
                body: 'Nuestra póliza cubre pérdida de cota mayor a 2.5 cm y quiebre de espirales. Trámite directo con la dirección técnica de planta.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-white/10 bg-[#07133B]/40 p-5 hover:border-[#C5A059]/40 transition-colors"
              >
                <h4 className="font-display text-base font-normal text-white">
                  {item.title}
                </h4>
                <p className="mt-2 font-body text-xs text-white/60 leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
