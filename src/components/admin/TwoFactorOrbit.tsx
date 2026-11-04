'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'

// ─── Public API exposed via ref ─────────────────────────────────────────────
export interface TwoFactorOrbitHandle {
  /** Spin the ring 450° when the user finishes typing all 6 digits */
  triggerSpin: () => void
  /** Set the ring stroke to the success (green) colour */
  setSuccess: () => void
  /** Set the ring stroke to the error (red) colour and shake the hub */
  setError: () => void
  /** Reset stroke and hub to their idle state */
  reset: () => void
}

// ─── Internal animation constants ───────────────────────────────────────────
const WIND_UP_BRAKE = 'cubic-bezier(0.25, 1, 0.5, 1)'
const SHAKE_EASE    = 'cubic-bezier(0.36, 0.07, 0.19, 0.97)'

const TwoFactorOrbit = forwardRef<TwoFactorOrbitHandle>((_, ref) => {
  const ringRef = useRef<SVGCircleElement>(null)
  const hubRef  = useRef<HTMLSpanElement>(null)

  useImperativeHandle(ref, () => ({
    triggerSpin() {
      const ring = ringRef.current
      if (!ring) return
      ring.animate(
        [
          { strokeDashoffset: '0' },
          { strokeDashoffset: '-80' },
          { strokeDashoffset: '0' },
        ],
        { duration: 800, easing: WIND_UP_BRAKE }
      )
    },

    setSuccess() {
      const ring = ringRef.current
      const hub  = hubRef.current
      if (!ring || !hub) return

      // Stroke → green
      ring.classList.remove('orbit__path--error')
      ring.classList.add('orbit__path--success')

      // Hub pulses once
      hub.animate(
        [
          { transform: 'scale(1)',    opacity: '1' },
          { transform: 'scale(1.35)', opacity: '0.7' },
          { transform: 'scale(1)',    opacity: '1' },
        ],
        { duration: 500, easing: 'ease-out' }
      )
    },

    setError() {
      const ring = ringRef.current
      const hub  = hubRef.current
      if (!ring || !hub) return

      // Stroke → red
      ring.classList.remove('orbit__path--success')
      ring.classList.add('orbit__path--error')

      // Hub shakes horizontally
      hub.animate(
        [
          { transform: 'translateX(0px)'  },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)'  },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)'  },
          { transform: 'translateX(0px)'  },
        ],
        { duration: 420, easing: SHAKE_EASE }
      )
    },

    reset() {
      const ring = ringRef.current
      if (!ring) return
      ring.classList.remove('orbit__path--success', 'orbit__path--error')
    },
  }))

  return (
    /* Orbit ring wrapper – purely decorative, aria-hidden */
    <div className="orbit" aria-hidden="true">
      <svg className="orbit__ring" viewBox="0 0 100 100">
        <circle
          ref={ringRef}
          cx="50"
          cy="50"
          r="40"
          vectorEffect="non-scaling-stroke"
          className="orbit__path"
        />
      </svg>
      {/* Lock icon sits at the geometric centre (the "hub") */}
      <span ref={hubRef} className="orbit__hub">
        <svg
          className="w-7 h-7 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </span>
    </div>
  )
})

TwoFactorOrbit.displayName = 'TwoFactorOrbit'
export default TwoFactorOrbit
