'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatCOP } from '@/lib/utils'

// Immediate server-grade initial products matching PRECIOS PAGINA WEB.xlsx to guarantee ZERO CLS and 100% price parity
const INITIAL_FEATURED_PRODUCTS: Product[] = [
  {
    id: 'oasis-colchon-ortopedico-resortado',
    slug: 'colchon-ortopedico-resortado',
    name: 'Colchón Ortopédico Resortado',
    tagline: 'Mayor rigidez biomecánica y amortiguación reforzada para la columna',
    description: 'Panel Bonell 5 vueltas con 2 láminas de Algodón Laminado de 5 mm y 2 láminas de Cazata prensada D120 de 2.8 cm (sin D26). Altura: 25 cm.',
    longDescription: 'Panel Bonell 5 vueltas con 2 láminas de Algodón Laminado de 5 mm y 2 láminas de Cazata prensada D120 de 2.8 cm (sin D26). Altura: 25 cm.',
    category: 'colchones',
    technology: [
      'Soporte Ortopédico Reforzado',
      'Cazata D120 Biomecánica',
      'Doble Cara Útil'
    ],
    materials: [
      'Un panel Resortado tipo Bonell 5 vueltas',
      '2 láminas de Algodón Laminado de 5 mm',
      '2 láminas de Cazata D120 de 2.8 cm',
      'Jacquard doble acolchado'
    ],
    imageUrl: '/images/products/colchon-ortopedico-resortado/ambientada.webp',
    imageGallery: [
      '/images/products/colchon-ortopedico-resortado/ambientada.webp',
      '/images/products/colchon-ortopedico-resortado/frente.webp',
      '/images/products/colchon-ortopedico-resortado/lado.webp',
      '/images/products/colchon-ortopedico-resortado/detalle.webp'
    ],
    firmnessImage: '/images/products/colchon-ortopedico-resortado/firmeza.webp',
    height: '25 cm',
    warranty: '6 Años',
    variants: [
      { size: 'Semisencillo (90×190)', dimensions: '90 × 190 cm', price: 770000, stock: 30 },
      { size: 'Sencillo (100×190)', dimensions: '100 × 190 cm', price: 770000, stock: 30 },
      { size: 'Semidoble (120×190)', dimensions: '120 × 190 cm', price: 830000, stock: 30 },
      { size: 'Doble (140×190)', dimensions: '140 × 190 cm', price: 930000, stock: 30 },
      { size: 'Queen (160×190)', dimensions: '160 × 190 cm', price: 1135000, stock: 20 },
      { size: 'King (200×200)', dimensions: '200 × 200 cm', price: 1340000, stock: 15 },
      { size: 'Tipo Libro Queen (160×190)', dimensions: '160 × 190 cm (Plegable)', price: 1335000, stock: 10 },
      { size: 'Tipo Libro King (200×200)', dimensions: '200 × 200 cm (Plegable)', price: 1540000, stock: 10 }
    ],
    featured: true,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T18:00:00.000Z'
  },
  {
    id: 'oasis-colchon-ortopedico-clinico',
    slug: 'colchon-ortopedico-clinico',
    name: 'Colchón Ortopédico Clínico',
    tagline: 'Máxima firmeza recomendada por especialistas para cuidado postural',
    description: 'Núcleo macizo de Cazata D120 de 10 cm con 2 láminas de Espuma Rosada D26 de 5 cm. Firmeza ortopédica clínica sin resortes. Altura: 24 cm.',
    longDescription: 'Núcleo macizo de Cazata D120 de 10 cm con 2 láminas de Espuma Rosada D26 de 5 cm. Firmeza ortopédica clínica sin resortes. Altura: 24 cm.',
    category: 'colchones',
    technology: [
      'Núcleo Clínico D120',
      'Alineación Vertebral Óptima',
      'Tratamiento Hipoalergénico'
    ],
    materials: [
      'Una lámina de Cazata D120 de 10 cm',
      '2 láminas de Espuma Rosada D26 de 5 cm',
      'Jacquard doble acolchado con algodón'
    ],
    imageUrl: '/images/products/colchon-ortopedico-clinico/ambientada.webp',
    imageGallery: [
      '/images/products/colchon-ortopedico-clinico/ambientada.webp',
      '/images/products/colchon-ortopedico-clinico/frente.webp',
      '/images/products/colchon-ortopedico-clinico/lado.webp',
      '/images/products/colchon-ortopedico-clinico/detalle.webp'
    ],
    firmnessImage: '/images/products/colchon-ortopedico-clinico/firmeza.webp',
    height: '24 cm',
    warranty: '5 Años',
    variants: [
      { size: 'Semisencillo (90×190)', dimensions: '90 × 190 cm', price: 940000, stock: 25 },
      { size: 'Sencillo (100×190)', dimensions: '100 × 190 cm', price: 940000, stock: 25 },
      { size: 'Semidoble (120×190)', dimensions: '120 × 190 cm', price: 990000, stock: 25 },
      { size: 'Doble (140×190)', dimensions: '140 × 190 cm', price: 1100000, stock: 25 },
      { size: 'Queen (160×190)', dimensions: '160 × 190 cm', price: 1300000, stock: 20 },
      { size: 'King (200×200)', dimensions: '200 × 200 cm', price: 1560000, stock: 15 }
    ],
    featured: true,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T18:00:00.000Z'
  },
  {
    id: 'oasis-colchon-pillow-top-original',
    slug: 'colchon-pillow-top-original',
    name: 'Colchón Pillow Top Original',
    tagline: 'Confort de lujo hotelero con doble Pillow Top en espuma Penta ultra-suave',
    description: 'Panel Bonell 5 vueltas sin politubos, con capas aislantes en Algodón Laminado, Politex, Cazata D120 y Espuma Penta D26. Altura: 35 cm.',
    longDescription: 'Panel Bonell 5 vueltas sin politubos, con capas aislantes en Algodón Laminado, Politex, Cazata D120 y Espuma Penta D26. Altura: 35 cm.',
    category: 'colchones',
    technology: [
      'Doble Pillow Top Integrado',
      'Panel Bonell 5 Vueltas (Sin Politubos)',
      'Termorregulación Activa'
    ],
    materials: [
      'Un panel Resortado tipo Bonell 5 vueltas',
      '2 láminas de Algodón Laminado de 5 mm',
      '2 láminas de Politex de 5 mm',
      '2 láminas de Espuma Rosada D26 de 1.5 cm',
      '2 láminas de Cazata D120 de 2.8 cm',
      '2 láminas de Espuma Penta D26 de 3 cm',
      'Jacquard Doble Acolchado'
    ],
    imageUrl: '/images/products/colchon-pillow-top-original/ambientada.webp',
    imageGallery: [
      '/images/products/colchon-pillow-top-original/ambientada.webp',
      '/images/products/colchon-pillow-top-original/frente.webp',
      '/images/products/colchon-pillow-top-original/lado.webp',
      '/images/products/colchon-pillow-top-original/detalle.webp'
    ],
    firmnessImage: '/images/products/colchon-pillow-top-original/firmeza.webp',
    height: '35 cm',
    warranty: '6 Años',
    variants: [
      { size: 'Semisencillo (90×190)', dimensions: '90 × 190 cm', price: 1350000, stock: 15 },
      { size: 'Sencillo (100×190)', dimensions: '100 × 190 cm', price: 1350000, stock: 15 },
      { size: 'Semidoble (120×190)', dimensions: '120 × 190 cm', price: 1460000, stock: 15 },
      { size: 'Doble (140×190)', dimensions: '140 × 190 cm', price: 1560000, stock: 15 },
      { size: 'Queen (160×190)', dimensions: '160 × 190 cm', price: 1770000, stock: 12 },
      { size: 'King (200×200)', dimensions: '200 × 200 cm', price: 2185000, stock: 10 },
      { size: 'Tipo Libro Queen (160×190)', dimensions: '160 × 190 cm (Plegable)', price: 2020000, stock: 6 },
      { size: 'Tipo Libro King (200×200)', dimensions: '200 × 200 cm (Plegable)', price: 2435000, stock: 6 }
    ],
    featured: true,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T18:00:00.000Z'
  },
  {
    id: 'oasis-colchon-pillow-top-pocket-resortes-independientes',
    slug: 'colchon-pillow-top-pocket-resortes-independientes',
    name: 'Colchón Pillow Top Pocket',
    tagline: 'Cero transferencia de movimiento con resortes ensacados individuales y 42 cm de altura',
    description: 'El buque insignia de Oasis. Panel Pocket de resortes individuales con marco de acero, láminas de Cazata D120, Espuma Penta D26 y doble Pillow Top de máxima amortiguación. Altura: 42 cm.',
    longDescription: 'El buque insignia de Oasis. Panel Pocket de resortes individuales con marco de acero, láminas de Cazata D120, Espuma Penta D26 y doble Pillow Top de máxima amortiguación. Altura: 42 cm.',
    category: 'colchones',
    technology: [
      'Zero Transfer Pocket Springs',
      'Aislamiento Acústico Total',
      'Doble Pillow Top 42cm'
    ],
    materials: [
      'Un panel Resortado Pocket con marco de acero',
      '2 láminas de Algodón Laminado de 5 mm',
      '2 láminas de Politex de 5 mm',
      '2 láminas de Espuma Rosada D26 de 1.5 cm',
      '2 láminas de Cazata D120 de 2.8 cm',
      '2 láminas de Espuma Penta D26 de 3 cm',
      'Jacquard doble acolchado'
    ],
    imageUrl: '/images/products/colchon-pillow-top-pocket-resortes-independientes/ambientada.webp',
    imageGallery: [
      '/images/products/colchon-pillow-top-pocket-resortes-independientes/ambientada.webp',
      '/images/products/colchon-pillow-top-pocket-resortes-independientes/frente.webp',
      '/images/products/colchon-pillow-top-pocket-resortes-independientes/lado.webp',
      '/images/products/colchon-pillow-top-pocket-resortes-independientes/detalle.webp'
    ],
    firmnessImage: '/images/products/colchon-pillow-top-pocket-resortes-independientes/firmeza.webp',
    height: '42 cm',
    warranty: '8 Años',
    variants: [
      { size: 'Semisencillo (90×190)', dimensions: '90 × 190 cm', price: 1560000, stock: 15 },
      { size: 'Sencillo (100×190)', dimensions: '100 × 190 cm', price: 1560000, stock: 15 },
      { size: 'Semidoble (120×190)', dimensions: '120 × 190 cm', price: 1720000, stock: 15 },
      { size: 'Doble (140×190)', dimensions: '140 × 190 cm', price: 1870000, stock: 15 },
      { size: 'Queen (160×190)', dimensions: '160 × 190 cm', price: 2185000, stock: 12 },
      { size: 'King (200×200)', dimensions: '200 × 200 cm', price: 2705000, stock: 8 },
      { size: 'Tipo Libro Queen (160×190)', dimensions: '160 × 190 cm (Plegable)', price: 2385000, stock: 5 },
      { size: 'Tipo Libro King (200×200)', dimensions: '200 × 200 cm (Plegable)', price: 3005000, stock: 5 }
    ],
    featured: true,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T18:00:00.000Z'
  }
]

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL_FEATURED_PRODUCTS)

  useEffect(() => {
    fetch(`/api/catalog?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
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
    <section className="px-6 lg:px-16 py-24 lg:py-32 border-t border-[#0A1B54]/10 bg-white">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-[#0A1B54]/10 pb-8 gap-4">
        <div>
          <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
            Selección de Alta Ingeniería
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0A1B54]">
            Modelos Biomecánicos Destacados.
          </h2>
          <p className="mt-2 font-body text-xs sm:text-sm text-[#0A1B54]/70 max-w-lg">
            Modelos confeccionados en nuestra planta de Bogotá con respaldo y garantía directa de fábrica según ficha técnica oficial.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 border border-[#0A1B54] bg-[#0A1B54] px-5 py-3 font-body text-xs uppercase tracking-widest text-white transition-all hover:bg-[#C5A059] hover:border-[#C5A059]"
        >
          Ve nuestro catálogo →
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
              className="group border border-[#0A1B54]/15 bg-[#FAF9F7] p-6 lg:p-8 transition-colors duration-300 hover:border-[#C5A059] hover:bg-white flex flex-col justify-between"
            >
              <div>
                {/* Product Image Showcase with Clip-Path Reveal */}
                <div className="relative mb-6 h-60 sm:h-72 w-full overflow-hidden border border-[#0A1B54]/10 bg-[#F5F5F3]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    priority={i < 2}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    {...(i < 2 ? {} : { loading: 'lazy' as const })}
                  />
                  <div className="absolute left-3 top-3 border border-[#C5A059] bg-[#0A1B54] px-2.5 py-1 backdrop-blur-sm shadow-sm">
                    <span className="font-body text-2xs uppercase tracking-wider text-white font-semibold">
                      Garantía: {product.warranty || '6 Años'}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3 border border-[#0A1B54]/15 bg-white/90 px-2.5 py-1 backdrop-blur-sm">
                    <span className="font-mono text-2xs text-[#0A1B54]/80">
                      5 Medidas
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#0A1B54] transition-colors duration-300 group-hover:text-[#C5A059]">
                    {product.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-[#0A1B54]/75 leading-relaxed line-clamp-2">
                    {product.tagline}
                  </p>
                </div>

                {/* Gráfica Oficial de Firmeza (Asset estático de ficha técnica, sin traducción a texto) */}
                <div className="mt-4 flex items-center justify-between border-t border-[#0A1B54]/10 pt-3">
                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/60 font-semibold block">
                      Firmeza Oficial
                    </span>
                    <span className="font-mono text-2xs text-[#C5A059]">
                      Altura: {product.height || '25 cm'}
                    </span>
                  </div>
                  <div className="relative aspect-[319/176] h-10 w-24 overflow-hidden">
                    <Image
                      src={product.firmnessImage || `/images/products/${product.slug}/firmeza.webp`}
                      alt={`Gráfica de firmeza oficial — ${product.name}`}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                </div>

                {/* Tech Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.technology.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="border border-[#0A1B54]/15 bg-white px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54]/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-8 flex items-center justify-between border-t border-[#0A1B54]/10 pt-6">
                <div>
                  <p className="font-display text-2xl font-normal text-[#0A1B54]">
                    Desde {formatCOP(minPrice)}
                  </p>
                </div>
                <Link
                  href={`/catalogo#${product.slug}`}
                  className="flex items-center gap-2 border border-[#0A1B54] bg-[#0A1B54] px-4 py-2.5 font-body text-xs uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#C5A059] hover:border-[#C5A059]"
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
