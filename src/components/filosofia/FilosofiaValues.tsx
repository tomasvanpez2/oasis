'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FilosofiaValues() {
  return (
    <section className="relative border-t border-[#0A1B54]/10 px-6 py-24 lg:px-16 lg:py-32 bg-white">
      <div className="mx-auto max-w-4xl text-center sm:text-left">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
        >
          Compromiso con el Hogar Colombiano • Origen de la empresa: Bogotá
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-[#0A1B54] leading-tight"
        >
          Poner a dormir bien a todos los colombianos.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 font-body text-sm sm:text-base text-[#0A1B54]/80 max-w-2xl leading-relaxed"
        >
          Aquel sueño que comenzó en 1998, recorriendo pueblos en un camión con perseverancia y vocación, hoy sigue vivo desde nuestra sede y planta de producción en Bogotá. En Oasis Colchones y Muebles evolucionamos y ampliamos horizontes, manteniendo intacto el compromiso familiar con tu descanso.
        </motion.p>

        {/* Notice: Button "Explorar catálogo" removed per strict requirement. Asesoría directa preserved. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5"
        >
          <a
            href="https://wa.me/573108529410?text=Hola%20Oasis%20Colchones%20y%20Muebles,%20quiero%20conocer%20m%C3%A1s%20sobre%20su%20historia%20y%20asesor%C3%ADa%20personalizada"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#0A1B54] bg-[#0A1B54] px-8 py-4 font-body text-xs uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#07133B] hover:border-[#07133B]"
          >
            Hablar con un Asesor en Bogotá
          </a>
        </motion.div>
      </div>
    </section>
  )
}
