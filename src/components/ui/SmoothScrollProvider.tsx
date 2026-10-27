'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

let lenis: Lenis | null = null

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis!.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])

  return <>{children}</>
}

export function getLenis() {
  return lenis
}
