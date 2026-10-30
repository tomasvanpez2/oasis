'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPath = searchParams.get('from') || '/admin'

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [devHint, setDevHint] = useState<string | null>(null)

  // TOTP Setup / QR Data
  const [totpSecret, setTotpSecret] = useState('')
  const [totpQrCode, setTotpQrCode] = useState('')
  const [totpUri, setTotpUri] = useState('')
  const [showQrSetup, setShowQrSetup] = useState(false)
  const [loadingSetup, setLoadingSetup] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // 30-second rolling countdown for TOTP RFC 6238
  const [secondsRemaining, setSecondsRemaining] = useState(
    30 - (Math.floor(Date.now() / 1000) % 30)
  )

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Rolling 30s countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      setSecondsRemaining(30 - (now % 30))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-focus first input on mount & load dev hint if in dev mode
  useEffect(() => {
    otpInputsRef.current[0]?.focus()

    // Fetch setup parameters silently so devHint & QR data are ready if needed
    fetch('/api/admin/verify-totp')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTotpSecret(data.secret || '')
          setTotpQrCode(data.qrCode || '')
          setTotpUri(data.otpauthUri || '')
          if (data.devTotpHint) {
            setDevHint(`[Modo Local] Código TOTP activo: ${data.devTotpHint}`)
          }
        }
      })
      .catch(() => {
        // Silently ignore setup pre-fetch errors
      })
  }, [])

  // Handle individual digit change or paste into any slot
  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    const newDigits = [...otpDigits]

    if (clean.length > 1) {
      // User pasted multiple digits into one slot
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
      setError('Por favor ingresa el código completo de 6 dígitos.')
      return
    }

    setIsLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: cleanOtp }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Código de verificación incorrecto.')
      }

      setInfoMessage('✓ Código verificado con éxito. Redirigiendo...')

      // Redirect immediately to target dashboard
      router.push(fromPath)
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al verificar el código de autenticación.'
      )
      setOtpDigits(['', '', '', '', '', ''])
      setTimeout(() => {
        otpInputsRef.current[0]?.focus()
      }, 50)
    } finally {
      setIsLoading(false)
    }
  }

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOtpCode(otpDigits.join(''))
  }

  // Toggle QR Setup Accordion
  const toggleQrSetup = async () => {
    const nextState = !showQrSetup
    setShowQrSetup(nextState)

    if (nextState && !totpQrCode) {
      setLoadingSetup(true)
      try {
        const res = await fetch('/api/admin/verify-totp')
        const data = await res.json()
        if (data.success) {
          setTotpSecret(data.secret || '')
          setTotpQrCode(data.qrCode || '')
          setTotpUri(data.otpauthUri || '')
          if (data.devTotpHint) {
            setDevHint(`[Modo Local] Código TOTP activo: ${data.devTotpHint}`)
          }
        }
      } catch (err) {
        console.error('Error fetching TOTP setup:', err)
      } finally {
        setLoadingSetup(false)
      }
    }
  }

  const copySecretToClipboard = () => {
    if (!totpSecret) return
    navigator.clipboard.writeText(totpSecret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2500)
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
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          Apple Passwords & Google Authenticator
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-lg mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="bg-[#0D2266]/85 backdrop-blur-xl border border-gold/25 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header Monogram & Title */}
          <div className="text-center mb-6">
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
            <p className="text-xs text-gold/90 mt-1 uppercase tracking-widest font-medium">
              Autenticación 2FA de Acceso Rápido
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-red-400 font-bold shrink-0">⚠️</span>
              <p className="flex-1 leading-relaxed">{error}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <p className="flex-1 leading-relaxed">{infoMessage}</p>
            </div>
          )}

          {devHint && (
            <div className="mb-5 p-3 rounded-xl bg-gold/10 border border-gold/30 text-gold text-2xs font-mono break-all flex items-center justify-between">
              <span>{devHint}</span>
              <button
                type="button"
                onClick={() => {
                  const match = devHint.match(/\d{6}/)
                  if (match) {
                    const digits = match[0].split('')
                    setOtpDigits(digits)
                    verifyOtpCode(match[0])
                  }
                }}
                className="underline hover:text-white cursor-pointer ml-2 shrink-0 font-sans text-xs"
              >
                Autocompletar
              </button>
            </div>
          )}

          {/* Single-Step TOTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#0A1B54]/70 p-4 rounded-xl border border-gold/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-base">📱</span>
                <span className="text-xs text-ivory font-semibold">
                  Apple Passwords (FaceID / TouchID) o Google Authenticator
                </span>
              </div>
              <p className="text-xs text-ivory/70 leading-relaxed">
                Ingresa el código dinámico de{' '}
                <span className="text-gold font-bold">6 dígitos</span> de tu
                autenticador:
              </p>
              <div className="flex items-center justify-center gap-2 mt-2 text-2xs text-gold/80 font-mono">
                <span>Actualización en:</span>
                <span className="font-bold text-sm text-gold">
                  {secondsRemaining}s
                </span>
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              </div>
            </div>

            {/* 6 Digit Input Slots */}
            <div>
              <label
                htmlFor="otp-slot-0"
                className="block text-center text-2xs uppercase tracking-widest text-gold mb-3 font-medium"
              >
                Código de 6 Dígitos
              </label>
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

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-[#0A1B54] font-semibold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                  <span>Validando y Accediendo...</span>
                </>
              ) : (
                <>
                  <span>Verificar y Acceder</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          {/* Setup / QR Code Accordion */}
          <div className="border-t border-gold/15 pt-5 mt-6">
            <button
              type="button"
              onClick={toggleQrSetup}
              className="w-full text-center text-2xs text-gold/80 hover:text-gold flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1 font-medium"
            >
              <span>
                {showQrSetup
                  ? '▲ Ocultar vinculación'
                  : '▼ ¿Aún no tienes configurado el autenticador? Ver código QR'}
              </span>
            </button>

            {showQrSetup && (
              <div className="mt-4 bg-[#0A1B54] p-5 rounded-xl border border-gold/25 space-y-4 text-center animate-fadeIn">
                <p className="text-2xs text-ivory/80 leading-relaxed">
                  Escanea este código con la cámara de tu iPhone, Google
                  Authenticator o agrégalo a Contraseñas de Apple:
                </p>

                {loadingSetup ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-2xs text-gold/70">
                      Cargando parámetros 2FA...
                    </span>
                  </div>
                ) : (
                  <>
                    {totpQrCode && (
                      <div className="bg-white p-3.5 rounded-xl inline-block shadow-lg mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={totpQrCode}
                          alt="Código QR de Vinculación 2FA"
                          className="w-44 h-44 object-contain mx-auto"
                        />
                      </div>
                    )}

                    {/* Apple Passwords 1-Click Link */}
                    {totpUri && (
                      <div>
                        <a
                          href={totpUri}
                          className="inline-flex items-center gap-2 bg-[#0D2266] hover:bg-[#1A2E6B] text-gold border border-gold/40 px-4 py-2.5 rounded-xl text-2xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                        >
                          <span>🍏 Configurar en Contraseñas de Apple / Mac</span>
                        </a>
                      </div>
                    )}

                    {/* Manual Secret Key */}
                    {totpSecret && (
                      <div className="bg-[#08143F] p-3 rounded-lg border border-gold/15 text-left">
                        <div className="text-2xs text-gold uppercase tracking-wider mb-1 font-semibold">
                          Clave de Configuración Manual:
                        </div>
                        <div className="font-mono text-xs text-ivory break-all select-all flex items-center justify-between gap-2">
                          <span>{totpSecret}</span>
                          <button
                            type="button"
                            onClick={copySecretToClipboard}
                            className="text-2xs text-gold hover:text-white border border-gold/30 px-2.5 py-1 rounded shrink-0 cursor-pointer bg-gold/10"
                          >
                            {copiedSecret ? '¡Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="text-center text-2xs text-gold/40 pt-4 font-mono">
              RFC 6238 TOTP Standard (30s)
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-2xs text-ivory/40 mt-6 tracking-wider">
          Compatible con Contraseñas de Apple (iOS / macOS TouchID / FaceID), Google
          Authenticator y 1Password.
        </p>
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
              Cargando Seguridad 2FA...
            </span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
