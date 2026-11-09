'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Product, MattressSize } from '@/types'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface ProductRowProps {
  product: Product
  index: number
}

const CATEGORY_LABELS: Record<string, string> = {
  colchones: 'Colchón de Fábrica',
  colchonetas: 'Colchoneta D26',
  bases: 'Base Cama & Espaldar',
  almohadas: 'Almohada Viscoelástica / Ortopédica',
  protectores: 'Protector Termosellado',
  sabanas: 'Juego de Sábanas 180H',
}

export function ProductRow({ product, index }: ProductRowProps) {
  const [selectedSize, setSelectedSize] = useState<MattressSize>(product.variants[0]?.size || '')
  const [showDetails, setShowDetails] = useState(false)
  const [addedAnimation, setAddedAnimation] = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const gallery = product.imageGallery && product.imageGallery.length > 0
    ? product.imageGallery
    : [product.imageUrl]

  const currentImage = gallery[activeImgIdx] || product.imageUrl

  const selectedVariant =
    product.variants.find((v) => v.size === selectedSize) || product.variants[0]

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: selectedVariant.size,
      dimensions: selectedVariant.dimensions,
      price: selectedVariant.price,
      imageUrl: currentImage,
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
          
          {/* ── 1. PROMINENT PRODUCT IMAGE SLIDER / CAROUSEL ───────────── */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="relative aspect-[16/11] w-full overflow-hidden border border-white/15 bg-[#07133B] select-none group/slider">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={currentImage}
                    alt={`${product.name} — Foto ${activeImgIdx + 1} de ${gallery.length}`}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                    {...(index < 2 ? {} : { loading: 'lazy' as const })}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none z-10">
                <span className="border border-white/20 bg-[#0A1B54]/90 px-2 py-0.5 font-body text-2xs uppercase tracking-wider text-[#C5A059] backdrop-blur-sm">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                {product.featured && (
                  <span className="border border-[#C5A059] bg-[#C5A059] px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-[#0A1B54] font-bold">
                    Destacado
                  </span>
                )}
              </div>

              {/* Counter badge */}
              {gallery.length > 1 && (
                <div className="absolute right-3 top-3 border border-white/20 bg-[#070D38]/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur-sm z-10">
                  {activeImgIdx + 1} / {gallery.length}
                </div>
              )}

              {/* Prev / Next Slider Controls */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImgIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-[#2A21EA] hover:border-[#2A21EA] hover:scale-110 z-10"
                    aria-label="Foto anterior"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImgIdx((prev) => (prev + 1) % gallery.length)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-[#2A21EA] hover:border-[#2A21EA] hover:scale-110 z-10"
                    aria-label="Siguiente foto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Thumbnail dots */}
                  <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-10 px-2">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImgIdx(i)
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeImgIdx === i
                            ? 'w-6 bg-[#C5A059]'
                            : 'w-1.5 bg-white/40 hover:bg-white/80'
                        }`}
                        aria-label={`Ver foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
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
                      <span className="block font-mono text-[10px] text-current opacity-70">
                        {v.dimensions}
                      </span>
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
                * Flete Transporte Propio liquidado en checkout según zona de destino.
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
