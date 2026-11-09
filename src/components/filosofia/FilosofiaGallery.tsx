'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const GALLERY_ITEMS = [
  {
    src: '/images/products/colchon-pillow-top-pocket-resortes-independientes/foto-1.webp',
    alt: 'Colchón Pillow Top Pocket Oasis - Resortes Independientes',
    label: 'Colchón Pillow Top Pocket',
    spec: 'Resortes Independientes & Aislamiento de Movimiento',
    col: 'md:col-span-2',
  },
  {
    src: '/images/products/colchon-pillow-top-original/foto-1.webp',
    alt: 'Colchón Pillow Top Original Oasis Colchones y Muebles',
    label: 'Colchón Pillow Top Original',
    spec: 'Estructura Confiable y Duradera',
    col: 'md:col-span-1',
  },
  {
    src: '/images/products/colchon-ortopedico-clinico/foto-1.webp',
    alt: 'Colchón Ortopédico Clínico Oasis',
    label: 'Colchón Ortopédico Clínico',
    spec: 'Soporte Anatómico y Firmeza Equilibrada',
    col: 'md:col-span-1',
  },
  {
    src: '/images/products/colchon-semi-ortopedico-resortado/foto-1.webp',
    alt: 'Colchón Semi Ortopédico Resortado Oasis',
    label: 'Colchón Semi Ortopédico Resortado',
    spec: 'Materiales Seleccionados de Gran Resiliencia',
    col: 'md:col-span-2',
  },
]

export function FilosofiaGallery() {
  return (
    <section className="relative border-t border-white/10 px-6 py-20 lg:px-16 bg-[#07133B]/40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Calidad a la Vista
            </motion.p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-white">
              Estructuras que puedes ver por dentro
            </h2>
          </div>
          <p className="font-body text-xs text-white/60 max-w-md">
            Fabricamos con materiales de calidad que puedes comprobar. En Oasis, la calidad no se promete, se muestra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.figure
              key={item.label}
              className={`relative film-grain overflow-hidden border border-white/10 ${item.col} min-h-[280px] sm:min-h-[320px] group bg-[#0A1B54]`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B54] via-transparent to-transparent opacity-80" />
              <figcaption className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#0A1B54]/90 px-5 py-3.5 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="font-body text-xs sm:text-sm font-medium text-white">
                    {item.label}
                  </p>
                  <p className="font-mono text-[11px] text-[#C5A059]">
                    {item.spec}
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-0.5">
                  Oasis Oficial
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
