'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatCOP } from '@/lib/utils'

// Immediate server-grade initial products to guarantee ZERO CLS and eliminate empty states
const INITIAL_FEATURED_PRODUCTS: Product[] = [
  {
    id: 'prod-002',
    slug: 'oasis-noche',
    name: 'Oasis Noche',
    tagline: 'Arquitectura de resortes para soporte preciso.',
    description: 'Sistema de resortes ensacados independientes con 800 espirales por unidad Queen.',
    longDescription:
      'El Oasis Noche redefine el soporte con 800 resortes ensacados independientes en tamaño Queen. Cada espiral trabaja de forma autónoma, eliminando la transferencia de movimiento y adaptando el soporte a cada zona del cuerpo.',
    category: 'resortes',
    technology: ['800 Resortes Ensacados', 'Independencia de Movimiento', 'HR-35 Acolchado'],
    materials: ['Acero Templado', 'Espuma HR-35', 'Algodón Natural', 'Forro Bambú'],
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
    ],
    variants: [
      { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1280000, stock: 10 },
      { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1480000, stock: 8 },
      { size: 'Doble', dimensions: '140 × 190 cm', price: 1680000, stock: 7 },
      { size: 'Queen', dimensions: '160 × 190 cm', price: 1950000, stock: 6 },
      { size: 'King', dimensions: '200 × 200 cm', price: 2350000, stock: 4 },
    ],
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-003',
    slug: 'oasis-aurora',
    name: 'Oasis Aurora',
    tagline: 'Látex natural Dunlop. Elasticidad biológica sin memoria sintética.',
    description: 'Látex natural Dunlop de 10 cm sobre base de resortes ensacados.',
    longDescription:
      'El látex natural Dunlop del Oasis Aurora proviene de plantaciones certificadas de Hevea brasiliensis. Su estructura celular abierta garantiza una ventilación 3× superior a la espuma convencional.',
    category: 'latex',
    technology: ['Látex Dunlop Natural', 'Certificado Oeko-Tex', 'Ventilación Activa'],
    materials: ['Látex Natural 65 kg/m³', 'Resortes Ensacados', 'Forro Algodón Orgánico'],
    imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    imageGallery: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&q=80',
    ],
    variants: [
      { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1890000, stock: 6 },
      { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 2180000, stock: 5 },
      { size: 'Doble', dimensions: '140 × 190 cm', price: 2490000, stock: 4 },
      { size: 'Queen', dimensions: '160 × 190 cm', price: 2850000, stock: 3 },
      { size: 'King', dimensions: '200 × 200 cm', price: 3380000, stock: 2 },
    ],
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-005',
    slug: 'oasis-luna',
    name: 'Oasis Luna',
    tagline: 'Memory foam infusionado con partículas de gel refrescante.',
    description: 'Memory foam de 5 cm de confort con regulación térmica activa.',
    longDescription:
      'El Oasis Luna integra partículas de gel de enfriamiento en cada célula del memory foam para mitigar la acumulación térmica en climas templados o cálidos.',
    category: 'premium',
    technology: ['Gel Cooling Technology', 'Memory Foam Premium', 'Regulación Térmica Activa'],
    materials: ['Memory Foam + Gel 5cm', 'Espuma Base HR-40', 'Forro 3D Air Mesh'],
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    imageGallery: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80'],
    variants: [
      { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1480000, stock: 9 },
      { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1720000, stock: 7 },
      { size: 'Doble', dimensions: '140 × 190 cm', price: 1950000, stock: 6 },
      { size: 'Queen', dimensions: '160 × 190 cm', price: 2180000, stock: 5 },
      { size: 'King', dimensions: '200 × 200 cm', price: 2680000, stock: 3 },
    ],
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-007',
    slug: 'oasis-cumbre',
    name: 'Oasis Cumbre',
    tagline: '1000 resortes ensacados independientes y pillow top removible.',
    description: 'Máxima densidad de resortes ensacados con acolchado superior lavable.',
    longDescription:
      'El Oasis Cumbre alcanza la máxima densidad biomecánica con 1000 espirales ensacadas de acero al carbono en medida Queen y pillow top de memory foam de alta resiliencia.',
    category: 'premium',
    technology: ['1000 Resortes Ensacados', 'Pillow Top Removible', 'Memory Foam Premium'],
    materials: ['Acero Templado', 'Memory Foam 5cm', 'Microfibra Premium', 'Forro Tencel'],
    imageUrl: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80',
    imageGallery: ['https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=1200&q=80'],
    variants: [
      { size: 'Sencillo', dimensions: '90 × 190 cm', price: 2180000, stock: 6 },
      { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 2580000, stock: 5 },
      { size: 'Doble', dimensions: '140 × 190 cm', price: 2950000, stock: 4 },
      { size: 'Queen', dimensions: '160 × 190 cm', price: 3380000, stock: 3 },
      { size: 'King', dimensions: '200 × 200 cm', price: 4050000, stock: 2 },
    ],
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL_FEATURED_PRODUCTS)

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const featured = data.products.filter((p: Product) => p.featured).slice(0, 4)
          setProducts(featured.length ? featured : data.products.slice(0, 4))
        }
      })
      .catch((err) => {
        console.warn('[FeaturedProducts:fetchFallback]', err)
      })
  }, [])

  return (
    <section className="px-6 lg:px-16 py-24 lg:py-32 border-t border-white/10 bg-[#0A1B54]">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-4">
        <div>
          <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]">
            Selección de Alta Ingeniería
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
            Modelos Biomecánicos Destacados.
          </h2>
          <p className="mt-2 font-body text-xs sm:text-sm text-white/60 max-w-lg">
            Referencias confeccionadas en nuestra planta de Bogotá con certificación de fatiga y garantía directa de 10 a 15 años.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 font-body text-xs uppercase tracking-widest text-white transition-all hover:border-[#C5A059] hover:text-[#C5A059]"
        >
          Ver las 13 referencias →
        </Link>
      </div>

      {/* Products grid — asymmetric layout with prominent photographs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {products.map((product, i) => {
          const minPrice = Math.min(...product.variants.map((v) => v.price))
          return (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group border border-white/10 bg-[#07133B]/40 p-6 lg:p-8 transition-colors duration-300 hover:border-[#C5A059]/60 hover:bg-[#07133B]/70 flex flex-col justify-between"
            >
              <div>
                {/* Product Image Showcase with Clip-Path Reveal */}
                <div className="relative mb-6 h-60 sm:h-72 w-full overflow-hidden border border-white/10 bg-[#07133B]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 border border-white/20 bg-[#0A1B54]/90 px-2.5 py-1 backdrop-blur-sm">
                    <span className="font-body text-2xs uppercase tracking-wider text-[#C5A059]">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3 border border-white/20 bg-[#0A1B54]/90 px-2.5 py-1 backdrop-blur-sm">
                    <span className="font-mono text-2xs text-white/70">
                      5 Medidas
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-white transition-colors duration-300 group-hover:text-[#C5A059]">
                    {product.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2">
                    {product.tagline}
                  </p>
                </div>

                {/* Tech Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.technology.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="border border-white/15 bg-white/5 px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-white/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <p className="font-body text-2xs uppercase tracking-wider text-white/40">Precio de fábrica desde</p>
                  <p className="font-display text-2xl font-normal text-white">
                    {formatCOP(minPrice)}
                  </p>
                </div>
                <Link
                  href={`/catalogo#${product.slug}`}
                  className="flex items-center gap-2 border border-[#C5A059] bg-[#C5A059]/10 px-4 py-2.5 font-body text-xs uppercase tracking-widest text-[#C5A059] transition-all duration-300 hover:bg-[#C5A059] hover:text-[#0A1B54]"
                >
                  Personalizar
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
