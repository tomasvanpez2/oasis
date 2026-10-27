'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import type { Product } from '@/types'

interface CursorRevealProps {
  product: Product | null
  cursorX: number
  cursorY: number
}

export function CursorReveal({ product, cursorX, cursorY }: CursorRevealProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (isMobile) return null

  const OFFSET_X = 24
  const OFFSET_Y = -80

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            left: cursorX + OFFSET_X,
            top: cursorY + OFFSET_Y,
            pointerEvents: 'none',
            zIndex: 9999,
            width: 220,
            height: 160,
          }}
          className="overflow-hidden border border-white/20"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="220px"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#0A1B54]/20" />
          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#0A1B54]/80 px-3 py-2">
            <p className="font-body text-2xs uppercase tracking-wider text-white/70">
              {product.name}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
