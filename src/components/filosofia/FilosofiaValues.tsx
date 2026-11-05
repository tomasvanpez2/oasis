'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function FilosofiaValues() {
  return (
    <section className="relative border-t border-white/10 px-6 py-24 lg:px-16 lg:py-32 bg-[#0A1B54]">
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
        >
          Compromiso con el Usuario Final
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight"
        >
          Fabricamos para que duermas bien los próximos 15 años.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 font-body text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed"
        >
          No respondemos a fondos de inversión que nos exijan abaratar la calidad de las espumas para inflar márgenes de balance. Respondemos a familias colombianas que buscan un colchón ergonómico, durable y honesto. Esa independencia es la que nos permite elegir siempre el material correcto, no el más económico.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-3 border border-white bg-white px-8 py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-transparent hover:text-white"
          >
            Explorar las 13 Referencias
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/contacto"
            className="border border-white/20 bg-white/5 px-6 py-4 font-body text-xs uppercase tracking-widest text-white/80 transition-all duration-300 hover:border-[#C5A059] hover:text-[#C5A059]"
          >
            Contactar Ingeniero de Planta
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
