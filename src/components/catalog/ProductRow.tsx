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

// Mapeo estricto y verificado desde el documento "Ficha Técnica" oficial de Oasis Colchones
const MATTRESS_FIRMNESS_BY_SLUG: Record<string, 'Suave' | 'Medio' | 'Firme'> = {
  'colchoneta-de-espuma-rosada-d26': 'Medio',
  'colchon-semi-anatomico-de-espuma-rosada-d26': 'Firme',
  'colchon-semi-ortopedico-resortado': 'Medio',
  'colchon-ortopedico-resortado': 'Firme',
  'colchon-ortopedico-clinico': 'Firme',
  'colchon-imitacion-pillow-penta': 'Medio',
  'colchon-imitacion-pillow-antiescaras': 'Firme',
  'colchon-pillow-top-original': 'Medio',
  'colchon-pillow-top-encapsulado': 'Firme',
  'colchon-pillow-top-pocket-resortes-independientes': 'Medio',
}

const CATEGORY_LABELS: Record<string, string> = {
  colchonetas: 'Colchoneta D26',
  bases: 'Base Cama & Espaldar',
  almohadas: 'Almohada Viscoelástica / Ortopédica',
  protectores: 'Protector Termosellado',
  sabanas: 'Juego de Sábanas 180H',
}

export function ProductRow({ product, index }: ProductRowProps) {
  const [selectedSize, setSelectedSize] = useState<MattressSize>(product.variants[0]?.size || '')
  const [addedAnimation, setAddedAnimation] = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const isMattress =
    product.category === 'colchones' ||
    product.category === 'colchonetas' ||
    Boolean(MATTRESS_FIRMNESS_BY_SLUG[product.slug])

  const firmness =
    product.firmness || MATTRESS_FIRMNESS_BY_SLUG[product.slug] || undefined

  // Orden estricto de galería: [0] Ambientada, [1] Frente, [2] Lado, [3] Detalle
  const gallery: string[] = isMattress
    ? [
        `/images/products/${product.slug}/ambientada.webp`,
        `/images/products/${product.slug}/frente.webp`,
        `/images/products/${product.slug}/lado.webp`,
        `/images/products/${product.slug}/detalle.webp`,
      ]
    : product.imageGallery && product.imageGallery.length > 0
    ? product.imageGallery
    : [product.imageUrl]

  const currentImage = gallery[activeImgIdx] || gallery[0] || product.imageUrl

  const technicalDiagramUrl =
    product.technicalDiagramUrl ||
    (isMattress ? `/images/products/${product.slug}/diagrama.webp` : null)

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
      className="group border-b border-[#0A1B54]/10 bg-white transition-colors duration-300 hover:bg-[#FAF9F7] list-none"
    >
      <div className="px-6 py-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start lg:gap-10">
          
          {/* ── 1. PROMINENT PRODUCT IMAGE SLIDER / GALLERY ───────────── */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative aspect-[16/11] w-full overflow-hidden border border-[#0A1B54]/15 bg-[#F5F5F3] select-none group/slider">
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
                    alt={`${product.name} — Vista ${
                      activeImgIdx === 0
                        ? 'Ambientada'
                        : activeImgIdx === 1
                        ? 'Frente'
                        : activeImgIdx === 2
                        ? 'Lado'
                        : 'Detalle'
                    }`}
                    fill
                    priority={index < 2}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                    {...(index < 2 ? {} : { loading: 'lazy' as const })}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badge de Firmeza estricto de Ficha Técnica (Badge "COLCHÓN DE FÁBRICA" eliminado) */}
              <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none z-10">
                {isMattress && firmness ? (
                  <span className="border border-[#C5A059] bg-[#0A1B54] px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-white font-semibold backdrop-blur-sm shadow-sm">
                    Firmeza: {firmness}
                  </span>
                ) : (
                  <span className="border border-[#0A1B54]/20 bg-white/95 px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54] font-medium backdrop-blur-sm shadow-sm">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                )}
                {product.featured && (
                  <span className="border border-[#C5A059] bg-[#C5A059] px-2.5 py-1 font-body text-[10px] uppercase tracking-wider text-[#0A1B54] font-bold shadow-sm">
                    Destacado
                  </span>
                )}
              </div>

              {/* Counter badge con etiqueta de vista */}
              {gallery.length > 1 && (
                <div className="absolute right-3 top-3 border border-[#0A1B54]/15 bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#0A1B54] backdrop-blur-sm z-10 font-medium">
                  {activeImgIdx === 0
                    ? '1/4 Ambientada'
                    : activeImgIdx === 1
                    ? '2/4 Frente'
                    : activeImgIdx === 2
                    ? '3/4 Lado'
                    : '4/4 Detalle'}
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-[#0A1B54]/20 bg-white/80 text-[#0A1B54] backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-[#0A1B54] hover:text-white z-10"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-[#0A1B54]/20 bg-white/80 text-[#0A1B54] backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/slider:opacity-100 transition-all duration-200 hover:bg-[#0A1B54] hover:text-white z-10"
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
                            : 'w-1.5 bg-[#0A1B54]/30 hover:bg-[#0A1B54]/70'
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
          <div className="space-y-4 md:col-span-4 lg:col-span-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xs text-[#C5A059] font-semibold">
                  REF #{String(index + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-6 bg-[#0A1B54]/20" />
                <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50">
                  {selectedVariant.dimensions}
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54] transition-colors duration-200 group-hover:text-[#C5A059]">
                {product.name}
              </h2>
              <p className="mt-1 font-body text-xs sm:text-sm text-[#0A1B54]/75 leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Materials & Tech Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.technology.map((tech) => (
                <span
                  key={tech}
                  className="border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-2.5 py-1 font-body text-2xs uppercase tracking-wider text-[#0A1B54]/70"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Size Variants Matrix Buttons */}
            <div className="pt-2">
              <p className="mb-2 font-body text-2xs uppercase tracking-[0.2em] text-[#0A1B54]/50 font-medium">
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
                          ? 'border-[#0A1B54] bg-[#0A1B54] text-white shadow-sm'
                          : 'border-[#0A1B54]/15 bg-white text-[#0A1B54]/70 hover:border-[#0A1B54]/50 hover:text-[#0A1B54]'
                      }`}
                    >
                      <span className="block font-body text-xs font-medium">{v.size}</span>
                      <span className="block font-mono text-[10px] text-current opacity-75">
                        {v.dimensions}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── 3. PRICING & DIRECT ADD TO CART ─────────────────────────── */}
          <div className="flex flex-col justify-between border-t border-[#0A1B54]/10 pt-6 md:col-span-3 md:border-t-0 md:border-l md:border-[#0A1B54]/10 md:pl-8 md:pt-0">
            <div>
              <p className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50">
                Precio Directo Fábrica
              </p>
              <p className="mt-1 font-display text-3xl font-normal text-[#0A1B54]">
                {formatCOP(selectedVariant.price)}
              </p>
              <p className="mt-0.5 font-body text-2xs text-[#C5A059] font-medium">
                IVA incluido • Sin intermediarios
              </p>
              <p className="mt-3 font-body text-2xs text-[#0A1B54]/50 leading-tight">
                * Despacho y flete liquidado en checkout según zona de destino.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full border py-3.5 px-4 font-body text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                  addedAnimation
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-[#0A1B54] bg-[#0A1B54] text-white hover:bg-[#C5A059] hover:border-[#C5A059]'
                }`}
              >
                {addedAnimation ? '✓ Agregado al Carrito' : 'Añadir al Carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. FICHA TÉCNICA (RENDERIZADO DIRECTO, SIN OCULTAMIENTO NI ACORDEÓN) ── */}
        <div className="mt-8 border-t border-[#0A1B54]/10 bg-[#FAF9F7] p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Header: "Ficha técnica" (sin la palabra "industrial") y descripción */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-normal text-[#0A1B54]">
                  Ficha técnica
                </h3>
                <span className="h-px flex-1 bg-[#0A1B54]/15" />
                {firmness && (
                  <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059] font-bold">
                    Nivel de firmeza: {firmness}
                  </span>
                )}
              </div>

              <p className="font-body text-sm text-[#0A1B54]/80 leading-relaxed">
                {product.longDescription}
              </p>

              {/* Materiales integrados en el núcleo */}
              <div className="pt-2">
                <p className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 font-semibold mb-2">
                  Materiales Integrados en Núcleo:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((mat) => (
                    <span
                      key={mat}
                      className="border border-[#0A1B54]/15 bg-white px-3 py-1 font-body text-xs text-[#0A1B54]/85 shadow-2xs"
                    >
                      ✓ {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Especificaciones de fabricación */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#0A1B54]/10 pt-4 mt-4">
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Garantía
                  </span>
                  <p className="font-display text-base text-[#0A1B54] font-medium">
                    10 a 15 Años
                  </p>
                </div>
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Origen
                  </span>
                  <p className="font-body text-sm text-[#0A1B54] font-medium">
                    Bogotá, Colombia
                  </p>
                </div>
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Fatiga Biomecánica
                  </span>
                  <p className="font-body text-sm text-[#C5A059] font-medium">
                    100.000 Ciclos
                  </p>
                </div>
              </div>
            </div>

            {/* Diagrama de la estructura interna renderizado directamente en la vista */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              {technicalDiagramUrl ? (
                <div className="w-full border border-[#0A1B54]/15 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#0A1B54]/10 pb-2 mb-3">
                    <span className="font-body text-2xs uppercase tracking-widest text-[#0A1B54]/60 font-semibold">
                      Arquitectura Interna de Capas
                    </span>
                    <span className="font-mono text-2xs text-[#C5A059] font-medium">
                      Corte Transversal
                    </span>
                  </div>
                  <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden">
                    <Image
                      src={technicalDiagramUrl}
                      alt={`Diagrama de estructura interna — ${product.name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full border border-[#0A1B54]/10 bg-white p-6 text-center">
                  <p className="font-body text-xs text-[#0A1B54]/60">
                    Estructura ensamblada con estándares de fábrica Oasis.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </motion.li>
  )
}
