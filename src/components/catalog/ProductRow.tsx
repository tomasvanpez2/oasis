'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product, MattressSize } from '@/types'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface ProductRowProps {
  product: Product
  index: number
}

const CATEGORY_LABELS: Record<string, string> = {
  espuma: 'Espuma Alta Densidad',
  resortes: 'Resortes Pocket Ensacados',
  latex: 'Látex Natural Dunlop',
  premium: 'Híbrido Alta Gama',
}

const CATEGORY_ACCENT: Record<string, string> = {
  espuma: '#3B82F6',
  resortes: '#C5A059',
  latex: '#10B981',
  premium: '#F59E0B',
}

export function ProductRow({ product, index }: ProductRowProps) {
  const [selectedSize, setSelectedSize] = useState<MattressSize>(product.variants[0]?.size || 'Queen')
  const [showDetails, setShowDetails] = useState(false)
  const [addedAnimation, setAddedAnimation] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const selectedVariant =
    product.variants.find((v) => v.size === selectedSize) || product.variants[0]

  function handleAddToCart() {
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: selectedVariant.size,
      dimensions: selectedVariant.dimensions,
      price: selectedVariant.price,
      imageUrl: product.imageUrl,
    })

    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 1500)
    openCart()
  }

  return (
    <motion.li
      id={product.slug}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-white/10 bg-[#0A1B54] transition-colors duration-300 hover:bg-[#0D2266]/30 list-none"
    >
      <div className="px-6 py-8 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start lg:gap-10">
          {/* ── 1. PROMINENT MATTRESS IMAGE (Always visible with or without cursor) ─ */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-[#07133B]">
              <img
                src={product.imageUrl}
                alt={`${product.name} — Colchón de fábrica Oasis`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="border border-white/20 bg-[#0A1B54]/90 px-2 py-0.5 font-body text-2xs uppercase tracking-wider text-[#C5A059] backdrop-blur-sm">
                  {CATEGORY_LABELS[product.category]}
                </span>
                {product.featured && (
                  <span className="border border-[#C5A059] bg-[#C5A059] px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-[#0A1B54] font-bold">
                    Destacado
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 border border-white/10 bg-[#0A1B54]/80 px-2 py-0.5 backdrop-blur-sm">
                <span className="font-mono text-2xs text-white/60">
                  Stock: {selectedVariant.stock} uds
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. PRODUCT DATA & SPECS ─────────────────────────────────── */}
          <div className="space-y-4 md:col-span-5 lg:col-span-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xs text-[#C5A059]">
                  REF #{String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-6 bg-white/20" />
                <span className="font-body text-2xs uppercase tracking-wider text-white/40">
                  {selectedVariant.dimensions}
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-white transition-colors duration-200 group-hover:text-[#C5A059]">
                {product.name}
              </h2>
              <p className="mt-1 font-body text-xs sm:text-sm text-white/70 leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Materials & Tech Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {product.technology.map((tech) => (
                <span
                  key={tech}
                  className="border border-white/15 bg-white/5 px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Size Variants Matrix Buttons */}
            <div className="pt-2">
              <p className="mb-2 font-body text-2xs uppercase tracking-[0.2em] text-white/40">
                Seleccionar Medida:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedSize === v.size
                  return (
                    <button
                      key={v.size}
                      type="button"
                      onClick={() => setSelectedSize(v.size)}
                      className={`border px-3 py-1.5 text-left transition-all ${
                        isSelected
                          ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#C5A059]'
                          : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <span className="block font-body text-xs font-medium">{v.size}</span>
                      <span className="block font-mono text-[10px] text-current opacity-70">{v.dimensions.split(' ')[0]} cm</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Technical Details Toggle */}
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex items-center gap-2 pt-2 font-body text-xs text-[#C5A059] hover:text-white transition-colors"
            >
              <span>{showDetails ? '− Ocultar ficha técnica' : '+ Ver arquitectura de capas y materiales'}</span>
            </button>
          </div>

          {/* ── 3. PRICING & DIRECT ADD TO CART ─────────────────────────── */}
          <div className="flex flex-col justify-between border-t border-white/10 pt-6 md:col-span-3 md:border-t-0 md:border-l md:border-white/10 md:pl-8 md:pt-0">
            <div>
              <p className="font-body text-2xs uppercase tracking-wider text-white/40">
                Precio Directo Fábrica
              </p>
              <p className="mt-1 font-display text-3xl font-normal text-white">
                {formatCOP(selectedVariant.price)}
              </p>
              <p className="mt-0.5 font-body text-2xs text-[#C5A059]">
                IVA incluido • Sin intermediarios
              </p>
              <p className="mt-3 font-body text-2xs text-white/40 leading-tight">
                * El flete de transporte se coordina por separado antes del despacho.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full border py-3.5 px-4 font-body text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                  addedAnimation
                    ? 'border-emerald-400 bg-emerald-400 text-[#0A1B54]'
                    : 'border-[#C5A059] bg-[#C5A059] text-[#0A1B54] hover:bg-white hover:border-white'
                }`}
              >
                {addedAnimation ? '✓ Agregado al Carrito' : 'Añadir al Carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* ── EXPANDABLE TECHNICAL ARCHITECTURE ──────────────────────── */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 border-t border-white/10 bg-[#07133B]/60 p-6 lg:p-8"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
                    Ficha Técnica Industrial
                  </p>
                  <p className="font-body text-sm text-white/80 leading-relaxed">
                    {product.longDescription}
                  </p>
                  <div className="pt-2">
                    <p className="font-body text-2xs uppercase tracking-wider text-white/40">
                      Materiales Integrados en Núcleo:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.materials.map((mat) => (
                        <span key={mat} className="border border-white/20 bg-white/5 px-2.5 py-1 font-body text-xs text-white/70">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-white/10 pt-4 md:border-t-0 md:border-l md:border-white/10 md:pl-6 md:pt-0">
                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40">
                      Garantía de Fábrica
                    </span>
                    <p className="font-display text-lg text-white">10 Años de Cobertura Total</p>
                  </div>
                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40">
                      Origen de Ensamblado
                    </span>
                    <p className="font-body text-sm text-white">Bogotá, D.C. — Fábrica Oasis</p>
                  </div>
                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40">
                      Ensayos Biomecánicos
                    </span>
                    <p className="font-body text-sm text-[#C5A059]">100,000 ciclos de compresión</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
