'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import type { Product } from '@/types'

interface CursorRevealProps {
  product: Product | null
}

export function CursorReveal({ product }: CursorRevealProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Fluid motion values for 60fps tracking without triggering React component re-renders
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  // Spring physics for quiet luxury smoothness
  const springX = useSpring(mouseX, { stiffness: 350, damping: 28, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 350, damping: 28, mass: 0.5 })

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches)

    const handlePointerMove = (e: MouseEvent) => {
      // Offset cursor preview slightly to avoid covering cursor
      mouseX.set(e.clientX + 24)
      mouseY.set(e.clientY - 90)
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('mousemove', handlePointerMove)
  }, [mouseX, mouseY])

  if (isTouchDevice) return null

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.85, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          animate={{ opacity: 1, scale: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ opacity: 0, scale: 0.85, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            left: springX,
            top: springY,
            pointerEvents: 'none',
            zIndex: 9999,
            width: 240,
            height: 170,
          }}
          className="overflow-hidden border border-[#C5A059] bg-[#0A1B54] shadow-2xl"
        >
          <div className="relative h-full w-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="240px"
              priority
            />
            {/* Dark contrast gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1B54] via-transparent to-transparent opacity-80" />
            
            {/* Technical HUD Overlay */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#0A1B54]/90 px-3 py-2 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="font-display text-xs text-white font-normal">
                  {product.name}
                </p>
                <p className="font-body text-[10px] uppercase tracking-wider text-[#C5A059]">
                  {product.category}
                </p>
              </div>
              <span className="font-mono text-[9px] text-white/50">
                5 Medidas
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
