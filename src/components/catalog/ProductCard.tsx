'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Product, ProductVariant } from '@/types'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { isResortadoProduct } from '@/lib/shipping'

interface ProductCardProps {
  product: Product
  index?: number
  showActions?: boolean
  initialVariant?: ProductVariant
}

export function ProductCard({
  product,
  index = 0,
  showActions = true,
  initialVariant,
}: ProductCardProps) {
  const isResortado = useMemo(() => isResortadoProduct(product), [product])

  // Variantes estándar base
  const standardVariants = useMemo(() => {
    return product.variants.filter((v) => !v.size.toLowerCase().includes('libro'))
  }, [product.variants])

  // Variantes Tipo Libro (solo resortados)
  const tipoLibroVariants = useMemo(() => {
    if (!isResortado) return []
    return product.variants.filter((v) => v.size.toLowerCase().includes('libro'))
  }, [product.variants, isResortado])

  const [selectedSize, setSelectedSize] = useState<string | null>(
    initialVariant ? initialVariant.size : null
  )
  const [isTipoLibro, setIsTipoLibro] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const minPrice = useMemo(() => {
    return Math.min(...product.variants.map((v) => v.price))
  }, [product.variants])

  // Determinar si el tamaño seleccionado admite Tipo Libro
  const isSizeEligibleForTipoLibro = useMemo(() => {
    if (!isResortado || !selectedSize) return false
    const lower = selectedSize.toLowerCase()
    return lower.includes('queen') || lower.includes('160') || lower.includes('king') || lower.includes('200')
  }, [isResortado, selectedSize])

  // Variante activa
  const activeVariant = useMemo(() => {
    if (!selectedSize) return null

    if (isResortado && isTipoLibro && isSizeEligibleForTipoLibro) {
      const lower = selectedSize.toLowerCase()
      const isQueen = lower.includes('queen') || lower.includes('160')
      const target = isQueen ? 'queen' : 'king'

      const matchedTL = tipoLibroVariants.find((v) => {
        const vl = v.size.toLowerCase()
        return target === 'queen' ? (vl.includes('queen') || vl.includes('160')) : (vl.includes('king') || vl.includes('200'))
      })
      if (matchedTL) return matchedTL
    }

    return (
      standardVariants.find((v) => v.size === selectedSize) ||
      product.variants.find((v) => v.size === selectedSize) ||
      null
    )
  }, [selectedSize, isResortado, isTipoLibro, isSizeEligibleForTipoLibro, tipoLibroVariants, standardVariants, product.variants])

  function handleSelectSize(size: string) {
    setSelectedSize(size)
    const lower = size.toLowerCase()
    const canDoLibro = isResortado && (lower.includes('queen') || lower.includes('160') || lower.includes('king') || lower.includes('200'))
    // Si el usuario elige Doble (140x190) o menor, purga cualquier selección de Tipo Libro
    if (!canDoLibro) {
      setIsTipoLibroSelectedSafe(false)
    }
  }

  function setIsTipoLibroSelectedSafe(val: boolean) {
    if (val && !isSizeEligibleForTipoLibro) {
      return // Bloqueo estricto adversarial
    }
    setIsTipoLibro(val)
  }

  function handleAddToCart() {
    const variantToAdd = activeVariant || standardVariants[0] || product.variants[0]
    if (!variantToAdd) return

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      category: product.category,
      size: variantToAdd.size,
      dimensions: variantToAdd.dimensions,
      price: variantToAdd.price,
      imageUrl: product.imageUrl,
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
    openCart()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col justify-between border border-[#0A1B54]/15 bg-[#FAF9F7] p-5 sm:p-6 transition-colors duration-300 hover:border-[#C5A059] hover:bg-white"
    >
      <div>
        {/* Imagen principal */}
        <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden border border-[#0A1B54]/10 bg-[#F5F5F3]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 border border-[#C5A059] bg-[#0A1B54] px-2.5 py-1 shadow-sm">
            <span className="font-body text-2xs uppercase tracking-wider text-white font-semibold">
              Garantía: {product.warranty || '6 Años'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <span className="font-mono text-2xs uppercase tracking-wider text-[#C5A059] font-medium block">
            {product.category}
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-normal text-[#0A1B54] transition-colors group-hover:text-[#C5A059]">
            {product.name}
          </h3>
          <p className="font-body text-xs text-[#0A1B54]/75 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Selector de medidas rápido si showActions */}
        {showActions && standardVariants.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[#0A1B54]/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-[11px] uppercase tracking-wider text-[#0A1B54]/60 font-semibold">
                Medidas disponibles:
              </span>
              {activeVariant && (
                <span className="font-mono text-[10px] text-[#C5A059]">
                  {activeVariant.dimensions}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {standardVariants.slice(0, 6).map((variant) => {
                const isSelected = variant.size === selectedSize
                return (
                  <button
                    key={variant.size}
                    type="button"
                    onClick={() => handleSelectSize(variant.size)}
                    className={`border px-2 py-1 text-2xs font-body transition-all ${
                      isSelected
                        ? 'border-[#C5A059] bg-[#0A1B54] text-white shadow-xs'
                        : 'border-[#0A1B54]/15 bg-white text-[#0A1B54] hover:border-[#0A1B54]/40'
                    }`}
                  >
                    {variant.size.split(' ')[0]}
                  </button>
                )
              })}
            </div>

            {/* Selector Tipo Libro condicional */}
            {isResortado && (
              <div className="pt-1.5">
                <button
                  type="button"
                  disabled={!isSizeEligibleForTipoLibro}
                  onClick={() => setIsTipoLibroSelectedSafe(!isTipoLibro)}
                  className={`w-full border px-2.5 py-1.5 text-left text-2xs transition-all ${
                    !isSizeEligibleForTipoLibro
                      ? 'border-gray-200 bg-gray-100/60 text-gray-400 cursor-not-allowed opacity-60'
                      : isTipoLibro
                      ? 'border-[#C5A059] bg-[#0A1B54] text-white shadow-xs'
                      : 'border-[#0A1B54]/20 bg-white text-[#0A1B54] hover:border-[#0A1B54]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {isTipoLibro ? '✓ Tipo Libro (Plegable)' : 'Opción Tipo Libro'}
                    </span>
                    <span className="font-mono text-[10px] text-[#C5A059]">
                      {isSizeEligibleForTipoLibro ? 'Queen & King' : 'Solo Queen / King'}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Visualización de Precios Estricta: "Desde $X" o "$X" ── */}
      <div className="mt-6 flex items-center justify-between border-t border-[#0A1B54]/10 pt-4">
        <div>
          <p className="font-display text-xl sm:text-2xl font-normal text-[#0A1B54]">
            {activeVariant ? formatCOP(activeVariant.price) : `Desde ${formatCOP(minPrice)}`}
          </p>
        </div>

        {showActions ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`border px-3.5 py-2 font-body text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
              isAdded
                ? 'border-[#10B981] bg-[#10B981] text-white'
                : 'border-[#0A1B54] bg-[#0A1B54] text-white hover:border-[#C5A059] hover:bg-[#C5A059]'
            }`}
          >
            {isAdded ? '✓ Añadido' : 'Comprar'}
          </button>
        ) : (
          <Link
            href={`/catalogo#${product.slug}`}
            className="border border-[#0A1B54] bg-[#0A1B54] px-3.5 py-2 font-body text-xs uppercase tracking-widest text-white transition-all hover:bg-[#C5A059] hover:border-[#C5A059]"
          >
            Ver más
          </Link>
        )}
      </div>
    </motion.article>
  )
}
