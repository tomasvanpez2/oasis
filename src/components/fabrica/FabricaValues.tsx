'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function FabricaValues() {
  return (
    <section className="border-t border-white/10 px-8 py-24 lg:px-16 lg:py-32">
      <div className="max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-display-md font-normal text-white"
        >
          Fabricamos para<br />que duermas mejor.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 font-body text-sm text-white/60 max-w-xl leading-relaxed"
        >
          No tenemos inversionistas externos exigiendo crecimiento trimestral.
          Somos una empresa familiar con veinte años de oficio. Eso nos da la libertad de
          fabricar el colchón correcto, no el más rentable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12"
        >
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-4 border border-white px-8 py-4 font-body text-xs uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-[#0A1B54]"
          >
            Ver el catálogo completo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
