'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const GALLERY_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80',
    alt: 'Corte mecánico de espumas de alta densidad HR-40',
    label: 'Corte de Precisión en Espumas HR',
    spec: 'Tolerancia ±1.5 mm',
    col: 'md:col-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    alt: 'Ensamblado manual de capas viscoelásticas y látex',
    label: 'Ensamblado Manual de Núcleos',
    spec: 'Fijación por Termofusión sin Solventes',
    col: 'md:col-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&q=80',
    alt: 'Inspección de calidad biomecánica en colchones terminados',
    label: 'Control Biomecánico Final',
    spec: 'Verificación de Planitud y Cota',
    col: 'md:col-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    alt: 'Almacenamiento de matrices de resortes pocket y látex Dunlop',
    label: 'Banco de Resortes Pocket Ensacados',
    spec: 'Acero al Carbono Calibre 14.5',
    col: 'md:col-span-2',
  },
]

export function FilosofiaGallery() {
  return (
    <section className="relative border-t border-white/10 px-6 py-20 lg:px-16 bg-[#07133B]/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Evidencia de Planta
            </motion.p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-white">
              Taller de Manufactura en Bogotá
            </h2>
          </div>
          <p className="font-body text-2xs uppercase tracking-wider text-white/50 max-w-sm">
            Fotografías directas de procesos de corte, termofusión y ensamblado de nuestras 13 referencias técnicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.figure
              key={item.label}
              className={`relative film-grain overflow-hidden border border-white/10 ${item.col} min-h-[280px] group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover opacity-65 transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#0A1B54]/90 px-4 py-3 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="font-body text-xs font-medium text-white">
                    {item.label}
                  </p>
                  <p className="font-mono text-[10px] text-[#C5A059]">
                    {item.spec}
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-0.5">
                  Planta Bogotá
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
