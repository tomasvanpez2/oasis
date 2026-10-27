'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatCOP } from '@/lib/utils'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.products) {
          const featured = data.products.filter((p: Product) => p.featured).slice(0, 4)
          setProducts(featured.length ? featured : data.products.slice(0, 4))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <section className="px-6 lg:px-16 py-24 lg:py-32 border-t border-white/10">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-4">
        <div>
          <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]">
            Selección Destacada
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
            Modelos de Alta Ingeniería.
          </h2>
          <p className="mt-2 font-body text-xs sm:text-sm text-white/50 max-w-lg">
            Referencias con aprobación biomecánica y ensamblado de precisión en fábrica.
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
              className="group border border-white/10 bg-[#0D2266]/20 p-6 lg:p-8 transition-colors duration-300 hover:border-[#C5A059]/60 hover:bg-[#0D2266]/40 flex flex-col justify-between"
            >
              <div>
                {/* Product Image Showcase */}
                <div className="relative mb-6 h-60 sm:h-72 w-full overflow-hidden border border-white/10 bg-[#07133B]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 border border-white/20 bg-[#0A1B54]/80 px-2.5 py-1 backdrop-blur-sm">
                    <span className="font-body text-2xs uppercase tracking-wider text-[#C5A059]">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3 border border-white/20 bg-[#0A1B54]/80 px-2.5 py-1 backdrop-blur-sm">
                    <span className="font-body text-2xs text-white/70">
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
                      className="border border-white/15 bg-white/5 px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-white/50"
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
