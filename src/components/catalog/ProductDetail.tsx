'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Product, MattressSize, ProductVariant } from '@/types'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { isResortadoProduct } from '@/lib/shipping'

interface ProductDetailProps {
  product: Product
  index?: number
}

// Alturas oficiales según ficha técnica
const MATTRESS_HEIGHT_BY_SLUG: Record<string, string> = {
  'colchoneta-de-espuma-rosada-d26': '12 cm',
  'colchon-semi-anatomico-de-espuma-rosada-d26': '17 cm',
  'colchon-semi-ortopedico-resortado': '25 cm',
  'colchon-ortopedico-resortado': '25 cm',
  'colchon-ortopedico-clinico': '24 cm',
  'colchon-imitacion-pillow-penta': '32 cm',
  'colchon-imitacion-pillow-antiescaras': '32 cm',
  'colchon-pillow-top-original': '35 cm',
  'colchon-pillow-top-encapsulado': '35 cm',
  'colchon-pillow-top-pocket-resortes-independientes': '42 cm',
}

const PRODUCT_WARRANTY_BY_SLUG: Record<string, string> = {
  'colchoneta-de-espuma-rosada-d26': '1 Año',
  'colchon-semi-anatomico-de-espuma-rosada-d26': '2 Años',
  'colchon-semi-ortopedico-resortado': '4 Años',
  'colchon-ortopedico-resortado': '6 Años',
  'colchon-ortopedico-clinico': '5 Años',
  'colchon-imitacion-pillow-penta': '6 Años',
  'colchon-imitacion-pillow-antiescaras': '6 Años',
  'colchon-pillow-top-original': '6 Años',
  'colchon-pillow-top-encapsulado': '8 Años',
  'colchon-pillow-top-pocket-resortes-independientes': '8 Años',
}

const CATEGORY_LABELS: Record<string, string> = {
  colchones: 'Colchón',
  colchonetas: 'Colchoneta D26',
  bases: 'Base Cama & Espaldar',
  almohadas: 'Almohada Viscoelástica',
  protectores: 'Protector Termosellado',
  sabanas: 'Juego de Sábanas 180H',
}

export function ProductDetail({ product, index = 0 }: ProductDetailProps) {
  const isResortado = useMemo(() => isResortadoProduct(product), [product])
  
  // Extraer variantes estándar base (sin Tipo Libro)
  const standardVariants = useMemo(() => {
    return product.variants.filter((v) => !v.size.toLowerCase().includes('libro'))
  }, [product.variants])

  // Variantes Tipo Libro (solo para resortados)
  const tipoLibroVariants = useMemo(() => {
    if (!isResortado) return []
    return product.variants.filter((v) => v.size.toLowerCase().includes('libro'))
  }, [product.variants, isResortado])

  // Medida base seleccionada (ej. Doble, Queen, King...)
  const [selectedBaseSize, setSelectedBaseSize] = useState<string>(
    standardVariants[0]?.size || product.variants[0]?.size || ''
  )

  // Formato: 'estandar' | 'libro' (Solo disponible si es resortado y el tamaño es Queen o King)
  const [isTipoLibroSelected, setIsTipoLibroSelected] = useState<boolean>(false)

  const [addedAnimation, setAddedAnimation] = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  // Comprobar si el tamaño actualmente seleccionado es elegible para Tipo Libro
  const isSizeEligibleForTipoLibro = useMemo(() => {
    if (!isResortado) return false
    const lower = selectedBaseSize.toLowerCase()
    return lower.includes('queen') || lower.includes('160') || lower.includes('king') || lower.includes('200')
  }, [isResortado, selectedBaseSize])

  // Variante efectiva seleccionada
  const activeVariant: ProductVariant | undefined = useMemo(() => {
    // Si el usuario tiene Tipo Libro activado y el tamaño es elegible:
    if (isResortado && isTipoLibroSelected && isSizeEligibleForTipoLibro) {
      const lower = selectedBaseSize.toLowerCase()
      const isQueen = lower.includes('queen') || lower.includes('160')
      const targetSize = isQueen ? 'queen' : 'king'

      const matchedTL = tipoLibroVariants.find((v) => {
        const vl = v.size.toLowerCase()
        return targetSize === 'queen' ? (vl.includes('queen') || vl.includes('160')) : (vl.includes('king') || vl.includes('200'))
      })

      if (matchedTL) return matchedTL
    }

    // Retornar variante estándar
    const standardMatch = standardVariants.find((v) => v.size === selectedBaseSize)
    return standardMatch || standardVariants[0] || product.variants[0]
  }, [isResortado, isTipoLibroSelected, isSizeEligibleForTipoLibro, selectedBaseSize, tipoLibroVariants, standardVariants, product.variants])

  // Manejador de cambio de tamaño
  function handleSelectBaseSize(size: string) {
    setSelectedBaseSize(size)
    const lower = size.toLowerCase()
    const canDoLibro = isResortado && (lower.includes('queen') || lower.includes('160') || lower.includes('king') || lower.includes('200'))
    // Si el tamaño no es elegible (ej. Doble 140x190), desactiva inmediatamente Tipo Libro
    if (!canDoLibro) {
      setIsTipoLibroSelected(false)
    }
  }

  // Manejador de selección de formato
  function handleToggleTipoLibro(enable: boolean) {
    if (!isSizeEligibleForTipoLibro && enable) {
      // Bloqueo estricto: no permite activar Tipo Libro si es Doble o tamaño no permitido
      return
    }
    setIsTipoLibroSelected(enable)
  }

  const isMattress =
    product.category === 'colchones' ||
    product.category === 'colchonetas' ||
    Boolean(MATTRESS_HEIGHT_BY_SLUG[product.slug])

  const firmnessImageUrl =
    product.firmnessImage ||
    (isMattress ? `/images/products/${product.slug}/firmeza.webp` : null)

  const warrantyText =
    product.warranty ||
    PRODUCT_WARRANTY_BY_SLUG[product.slug] ||
    (product.category === 'bases' ? '2 Años' : '1 Año')

  const heightText =
    product.height ||
    MATTRESS_HEIGHT_BY_SLUG[product.slug] ||
    (product.category === 'bases' ? '30 cm' : 'Estándar')

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

  // Precio mínimo para visualización "Desde $X" cuando no hay variante
  const minPrice = useMemo(() => {
    return Math.min(...product.variants.map((v) => v.price))
  }, [product.variants])

  function handleAddToCart() {
    if (!activeVariant) return
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      category: product.category,
      size: activeVariant.size,
      dimensions: activeVariant.dimensions,
      price: activeVariant.price,
      imageUrl: currentImage,
    })

    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 1500)
    openCart()
  }

  return (
    <motion.li
      id={product.slug}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-[#0A1B54]/10 bg-white transition-colors duration-300 hover:bg-[#FAF9F7] list-none"
    >
      <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-12 lg:py-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-start lg:gap-8">
          
          {/* ── 1. GALLERY & IMAGES ── */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#0A1B54]/15 bg-[#F5F5F3] select-none group/slider">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
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

              {/* Badges de Categoría y Destacado */}
              <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 pointer-events-none z-10">
                <span className="border border-[#0A1B54]/20 bg-white/95 px-2 py-0.5 font-body text-2xs uppercase tracking-wider text-[#0A1B54] font-medium backdrop-blur-sm shadow-2xs">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                {product.featured && (
                  <span className="border border-[#C5A059] bg-[#C5A059] px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-[#0A1B54] font-bold shadow-2xs">
                    Destacado
                  </span>
                )}
              </div>

              {/* Slider Arrows */}
              {gallery.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity duration-300 group-hover/slider:opacity-100 pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImgIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))
                    }}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center bg-white/90 text-[#0A1B54] backdrop-blur-sm border border-[#0A1B54]/10 transition-colors hover:bg-white shadow-sm"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImgIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                    }}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center bg-white/90 text-[#0A1B54] backdrop-blur-sm border border-[#0A1B54]/10 transition-colors hover:bg-white shadow-sm"
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {gallery.map((thumbUrl, tIdx) => (
                  <button
                    key={thumbUrl}
                    type="button"
                    onClick={() => setActiveImgIdx(tIdx)}
                    className={`relative h-11 sm:h-12 w-full overflow-hidden border transition-all ${
                      activeImgIdx === tIdx
                        ? 'border-[#C5A059] ring-1 ring-[#C5A059]'
                        : 'border-[#0A1B54]/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`Miniatura ${tIdx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. INFO & SELECTION ── */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-[#0A1B54]/10 pb-2 mb-2">
                <span className="font-mono text-2xs uppercase tracking-wider text-[#C5A059] font-medium">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                <span className="font-mono text-2xs text-[#0A1B54]/60">
                  Altura: {heightText}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-normal text-[#0A1B54] leading-tight">
                {product.name}
              </h2>
              <p className="mt-1 font-body text-xs sm:text-sm text-[#0A1B54]/75 leading-relaxed">
                {product.description}
              </p>

              {/* ── PRECIOS ESTRICTOS: "Desde $X" (sin variante) o "$X" (con variante seleccionada) ── */}
              <div className="my-3 flex items-baseline justify-between border-y border-[#0A1B54]/10 py-2.5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      {activeVariant ? formatCOP(activeVariant.price) : `Desde ${formatCOP(minPrice)}`}
                    </span>
                    <span className="font-mono text-2xs text-[#0A1B54]/50">COP</span>
                  </div>
                </div>
                {activeVariant && activeVariant.dimensions && (
                  <span className="font-mono text-2xs text-[#C5A059] border border-[#C5A059]/30 bg-[#C5A059]/10 px-2.5 py-1">
                    {activeVariant.dimensions}
                  </span>
                )}
              </div>

              {/* ── SELECTOR DE TAMAÑO BASE ── */}
              {standardVariants.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/60 font-semibold block">
                    Seleccionar Medida:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {standardVariants.map((variant) => {
                      const isSelected = variant.size === selectedBaseSize
                      return (
                        <button
                          key={variant.size}
                          type="button"
                          onClick={() => handleSelectBaseSize(variant.size)}
                          className={`border p-1.5 sm:p-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#C5A059] bg-[#0A1B54] text-white shadow-xs'
                              : 'border-[#0A1B54]/15 bg-white text-[#0A1B54] hover:border-[#0A1B54]/40 hover:bg-[#FAF9F7]'
                          }`}
                        >
                          <div className="font-body text-2xs font-semibold truncate leading-tight">
                            {variant.size}
                          </div>
                          <div
                            className={`font-mono text-2xs mt-0.5 ${
                              isSelected ? 'text-[#C5A059]' : 'text-[#0A1B54]/60'
                            }`}
                          >
                            {formatCOP(variant.price)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── REGLA DE ORO TIPO LIBRO: SOLO RESORTADOS Y SOLO QUEEN / KING ── */}
              {isResortado && (
                <div className="mb-3 border border-[#0A1B54]/15 bg-[#FAF9F7] p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54] font-semibold">
                      Formato de Estructura:
                    </span>
                    <span className="font-mono text-[10px] text-[#C5A059]">
                      Ingeniería de Acceso
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Opción 1: Enterizo Estándar */}
                    <button
                      type="button"
                      onClick={() => handleToggleTipoLibro(false)}
                      className={`border px-3 py-2 text-left transition-all text-2xs ${
                        !isTipoLibroSelected
                          ? 'border-[#C5A059] bg-[#0A1B54] text-white'
                          : 'border-[#0A1B54]/20 bg-white text-[#0A1B54] hover:border-[#0A1B54]/40'
                      }`}
                    >
                      <span className="font-semibold block">Enterizo Estándar</span>
                      <span className={`text-[10px] block mt-0.5 ${!isTipoLibroSelected ? 'text-[#C5A059]' : 'text-[#0A1B54]/60'}`}>
                        Estructura continua tradicional
                      </span>
                    </button>

                    {/* Opción 2: Tipo Libro Plegable (SOLO habilitada para Queen y King) */}
                    <button
                      type="button"
                      disabled={!isSizeEligibleForTipoLibro}
                      onClick={() => handleToggleTipoLibro(true)}
                      className={`border px-3 py-2 text-left transition-all text-2xs ${
                        !isSizeEligibleForTipoLibro
                          ? 'border-gray-200 bg-gray-100/70 text-gray-400 cursor-not-allowed opacity-60'
                          : isTipoLibroSelected
                          ? 'border-[#C5A059] bg-[#0A1B54] text-white shadow-xs'
                          : 'border-[#0A1B54]/20 bg-white text-[#0A1B54] hover:border-[#0A1B54]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Tipo Libro (Plegable)</span>
                        {isSizeEligibleForTipoLibro && (
                          <span className="text-[10px] text-[#C5A059] font-mono">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${
                        !isSizeEligibleForTipoLibro
                          ? 'text-gray-400 italic'
                          : isTipoLibroSelected
                          ? 'text-[#C5A059]'
                          : 'text-[#0A1B54]/60'
                      }`}>
                        {isSizeEligibleForTipoLibro
                          ? 'Módulo articulado para escaleras y puertas'
                          : 'Disponible solo en Queen y King'}
                      </span>
                    </button>
                  </div>

                  {!isSizeEligibleForTipoLibro && (
                    <p className="mt-2 font-body text-[11px] text-[#0A1B54]/60 italic">
                      ℹ️ La opción <strong>Tipo Libro</strong> está disponible exclusivamente para tamaños <strong>Queen (160×190)</strong> y <strong>King (200×200)</strong> en referencias resortadas para facilitar su traslado en escaleras o ascensores estrechos.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!activeVariant || activeVariant.stock === 0}
                className={`w-full py-3 px-4 font-body text-xs uppercase tracking-widest transition-all duration-300 font-semibold ${
                  addedAnimation
                    ? 'bg-[#10B981] text-white'
                    : activeVariant?.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#0A1B54] text-white hover:bg-[#C5A059] shadow-xs'
                }`}
              >
                {addedAnimation ? '✓ Añadido al Carrito' : 'Añadir al Carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. FICHA TÉCNICA ── */}
        <div className="mt-4 border-t border-[#0A1B54]/10 bg-[#FAF9F7] p-3.5 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6 items-start">
            
            <div className="space-y-3 lg:col-span-7">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg sm:text-xl font-normal text-[#0A1B54]">
                  Ficha técnica oficial
                </h3>
                <span className="h-px flex-1 bg-[#0A1B54]/15" />
                <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059] font-semibold">
                  Manufactura Bogotá
                </span>
              </div>

              <p className="font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                {product.longDescription}
              </p>

              <div>
                <p className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 font-semibold mb-1.5">
                  Materiales Integrados en Núcleo:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.materials.map((mat) => (
                    <span
                      key={mat}
                      className="border border-[#0A1B54]/15 bg-white px-2.5 py-0.5 font-body text-2xs text-[#0A1B54]/85 shadow-2xs"
                    >
                      ✓ {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-[#0A1B54]/10 pt-2.5 mt-2.5">
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Garantía
                  </span>
                  <p className="font-display text-sm sm:text-base text-[#0A1B54] font-medium">
                    {warrantyText}
                  </p>
                </div>
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Altura
                  </span>
                  <p className="font-body text-xs sm:text-sm text-[#0A1B54] font-medium">
                    {heightText}
                  </p>
                </div>
                <div>
                  <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                    Origen
                  </span>
                  <p className="font-body text-xs sm:text-sm text-[#C5A059] font-medium">
                    Bogotá D.C.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {technicalDiagramUrl ? (
                <div className="w-full border border-[#0A1B54]/15 bg-white p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#0A1B54]/10 pb-1 mb-1.5">
                    <span className="font-body text-[10px] uppercase tracking-wider text-[#0A1B54]/60 font-semibold">
                      Arquitectura Interna
                    </span>
                    <span className="font-mono text-[10px] text-[#C5A059] font-medium">
                      Corte Transversal
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] w-full max-w-[200px] mx-auto overflow-hidden">
                    <Image
                      src={technicalDiagramUrl}
                      alt={`Diagrama de estructura interna — ${product.name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 180px, 200px"
                    />
                  </div>
                </div>
              ) : null}

              {firmnessImageUrl && (
                <div className="w-full border border-[#0A1B54]/15 bg-white p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#0A1B54]/10 pb-1 mb-1.5">
                    <span className="font-body text-[10px] uppercase tracking-wider text-[#0A1B54]/60 font-semibold">
                      Gráfica Oficial de Firmeza
                    </span>
                    <span className="font-mono text-[10px] text-[#C5A059] font-medium">
                      Ficha Técnica
                    </span>
                  </div>
                  <div className="relative aspect-[319/176] w-full max-w-[190px] mx-auto overflow-hidden">
                    <Image
                      src={firmnessImageUrl}
                      alt={`Gráfica oficial de firmeza — ${product.name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 170px, 190px"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </motion.li>
  )
}
