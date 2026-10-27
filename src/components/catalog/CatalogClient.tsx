'use client'
import React, { useState, useEffect } from 'react'
import type { Product } from '@/types'
import { FilterBar } from './FilterBar'
import { ProductRow } from './ProductRow'
import { CursorReveal } from './CursorReveal'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'
import { motion } from 'framer-motion'

type CategoryFilter = 'todos' | 'espuma' | 'resortes' | 'latex' | 'premium'

export function CatalogClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('todos')
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.products) {
          setProducts(data.products)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('[catalog:fetch]', err)
        setLoading(false)
      })
  }, [])

  const filtered =
    activeFilter === 'todos'
      ? products
      : products.filter((p) => p.category === activeFilter)

  return (
    <div className="relative min-h-screen pt-28 pb-24">
      {/* 60fps Custom Cursor Image Reveal on Hover */}
      <CursorReveal product={hoveredProduct} />

      {/* Editorial Page Header with Text-Splitting */}
      <div className="border-b border-white/10 px-6 pb-12 lg:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Catálogo de Fábrica Directa
            </motion.p>
            <div className="mt-2">
              <TextSplitReveal
                text="13 Referencias Técnicas."
                as="h1"
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-white"
                delay={0.1}
                stagger={0.07}
              />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-xs sm:text-sm text-white/60 max-w-md leading-relaxed"
          >
            Cada modelo expuesto con su fotografía real, ficha técnica, matriz de 5 medidas y precio de salida de fábrica en Bogotá.
          </motion.p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Catalog Metric Sub-bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 lg:px-16 bg-[#07133B]/40">
        <span className="font-body text-2xs uppercase tracking-[0.2em] text-white/50">
          Mostrando {filtered.length} de {products.length} referencias
        </span>
        <span className="font-body text-2xs text-[#C5A059]">
          Garantía directa de 10 a 15 años
        </span>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center px-6 py-32 lg:px-16">
          <div className="h-6 w-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-body text-xs uppercase tracking-widest text-white/50">
            Cargando catálogo industrial...
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/10">
          {filtered.map((product, i) => (
            <ProductRow
              key={product.id}
              product={product}
              index={i}
              onHoverStart={(prod) => setHoveredProduct(prod)}
              onHoverEnd={() => setHoveredProduct(null)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
