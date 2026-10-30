'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const fromPath = searchParams.get('from') || '/admin'
  const safePath = fromPath.startsWith('/') && !fromPath.startsWith('//') ? fromPath : '/admin'

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first input on mount
  useEffect(() => {
    otpInputsRef.current[0]?.focus()
  }, [])

  // Handle individual digit change or paste into any slot
  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    const newDigits = [...otpDigits]

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setOtpDigits(newDigits)
      const nextFocus = Math.min(pasted.length, 5)
      otpInputsRef.current[nextFocus]?.focus()

      if (pasted.length === 6) {
        verifyOtpCode(newDigits.join(''))
      }
      return
    }

    newDigits[index] = clean
    setOtpDigits(newDigits)

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }

    // Auto-submit if all 6 slots are completed
    if (newDigits.every((d) => d.length === 1)) {
      verifyOtpCode(newDigits.join(''))
    }
  }

  // Keyboard navigation across slots
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  // Handle direct paste event on any slot
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newDigits = [...otpDigits]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char
    })
    setOtpDigits(newDigits)

    const nextFocus = Math.min(pastedData.length, 5)
    otpInputsRef.current[nextFocus]?.focus()

    if (pastedData.length === 6) {
      verifyOtpCode(newDigits.join(''))
    }
  }

  // Primary verification call to /api/admin/verify-totp
  const verifyOtpCode = async (otpString: string) => {
    const cleanOtp = otpString.trim().replace(/\D/g, '')

    if (cleanOtp.length !== 6) {
      setError('Mal código')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: cleanOtp }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error('Mal código')
      }

      // Código correcto: redirigir INMEDIATAMENTE al dashboard sin mostrar carteles
      window.location.replace(safePath)
    } catch {
      setError('Mal código')
      setOtpDigits(['', '', '', '', '', ''])
      setIsLoading(false)
      setTimeout(() => {
        otpInputsRef.current[0]?.focus()
      }, 50)
    }
  }

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOtpCode(otpDigits.join(''))
  }

  return (
    <div className="min-h-screen bg-[#0A1B54] text-ivory flex flex-col justify-between selection:bg-gold/30 selection:text-white relative overflow-hidden font-body">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#0D2266] rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-display text-2xl tracking-[0.2em] uppercase text-gold group-hover:text-gold-light transition-colors">
            Oasis
          </span>
          <span className="text-xs uppercase tracking-widest text-ivory/50 border-l border-gold/30 pl-3">
            Manufactura de Colchones
          </span>
        </Link>
        <div className="flex items-center gap-2 text-2xs text-gold/80 uppercase tracking-widest bg-gold/10 px-3.5 py-1.5 rounded-full border border-gold/25">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Panel Seguro 2FA
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="bg-[#0D2266]/85 backdrop-blur-xl border border-gold/25 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header Icon & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold mb-3 shadow-inner">
              <svg
                className="w-7 h-7"
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
            </div>
            <h1 className="font-display text-2xl tracking-wide text-ivory">
              Panel Administrativo
            </h1>
            <p className="text-xs text-gold/70 mt-1 uppercase tracking-widest">
              Ingresa el código de 6 dígitos
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm flex items-center justify-center gap-2 animate-fadeIn">
              <span className="text-red-400 font-bold">✕</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Simple 6-Digit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-slot-${idx}`}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    disabled={isLoading}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 bg-[#0A1B54] border border-gold/40 rounded-xl text-center text-xl font-bold font-mono text-gold focus:border-gold-light focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all shadow-inner disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-[#0A1B54] font-semibold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-2xs text-ivory/30 tracking-widest uppercase z-10">
        © 2026 Oasis Colchones S.A.S. — Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A1B54] flex items-center justify-center text-gold">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest">
              Cargando Seguridad...
            </span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
