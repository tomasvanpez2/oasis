'use client'
import React, { useEffect, useRef } from 'react'
import Lenis from 'lenis'

let globalLenisInstance: Lenis | null = null

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Only initialize in client window
    if (typeof window === 'undefined') return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis
    globalLenisInstance = lenis

    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time)
        rafIdRef.current = requestAnimationFrame(raf)
      }
    }

    rafIdRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      globalLenisInstance = null
    }
  }, [])

  return <>{children}</>
}

export function getLenis(): Lenis | null {
  return globalLenisInstance
}
