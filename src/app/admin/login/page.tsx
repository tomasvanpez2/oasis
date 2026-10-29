'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPath = searchParams.get('from') || '/admin'

  const [step, setStep] = useState<1 | 2>(1)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [challengeId, setChallengeId] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [devHint, setDevHint] = useState<string | null>(null)

  // TOTP Authenticator Data
  const [totpSecret, setTotpSecret] = useState('')
  const [totpQrCode, setTotpQrCode] = useState('')
  const [totpUri, setTotpUri] = useState('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // 30-second rolling countdown for TOTP
  const [secondsRemaining, setSecondsRemaining] = useState(30 - (Math.floor(Date.now() / 1000) % 30))

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 2) return
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      setSecondsRemaining(30 - (now % 30))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  // Step 1: Submit Master Password
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Por favor ingresa la contraseña maestra.')
      return
    }

    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/admin/auth/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Contraseña maestra inválida')
      }

      setChallengeId(data.challengeId)
      setTotpSecret(data.secret || '')
      setTotpQrCode(data.qrCode || '')
      setTotpUri(data.otpauthUri || '')
      setStep(2)

      if (data.devTotpHint) {
        setDevHint(`[Modo Local] Código TOTP activo: ${data.devTotpHint}`)
      }

      // Auto-focus first input
      setTimeout(() => {
        otpInputsRef.current[0]?.focus()
      }, 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  // Handle digit input in Step 2
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

    if (newDigits.every((d) => d.length === 1)) {
      verifyOtpCode(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  // Step 2: Verify TOTP Code
  const verifyOtpCode = async (otpString: string) => {
    if (otpString.length !== 6) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otpString,
          challengeId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.restartRequired) {
          setStep(1)
          setPassword('')
          setOtpDigits(['', '', '', '', '', ''])
          throw new Error(data.error || 'Desafío expirado. Inicia nuevamente.')
        }
        throw new Error(data.error || 'Código 2FA incorrecto')
      }

      // Success! Redirect to target
      router.push(fromPath)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al verificar 2FA')
      setOtpDigits(['', '', '', '', '', ''])
      otpInputsRef.current[0]?.focus()
    } finally {
      setLoading(false)
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
        <div className="flex items-center gap-2 text-2xs text-gold/70 uppercase tracking-widest bg-gold/5 px-3 py-1.5 rounded-full border border-gold/20">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          Google Authenticator & Apple Passwords
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-lg mx-auto px-6 py-8 z-10 flex-1 flex flex-col justify-center">
        <div className="bg-[#0D2266]/80 backdrop-blur-xl border border-gold/25 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header Monogram */}
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
            <p className="text-xs text-ivory/60 mt-1 uppercase tracking-widest">
              {step === 1 ? 'Paso 1: Clave Maestra' : 'Paso 2: Autenticador 2FA (TOTP)'}
            </p>
          </div>

          {/* Error & Info Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
              <span className="text-red-400 font-bold">⚠️</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <p className="flex-1">{infoMessage}</p>
            </div>
          )}

          {devHint && (
            <div className="mb-5 p-2.5 rounded bg-gold/10 border border-gold/30 text-gold text-2xs font-mono break-all flex items-center justify-between">
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
                className="underline hover:text-white cursor-pointer ml-2"
              >
                Autocompletar
              </button>
            </div>
          )}

          {/* STEP 1: Master Password */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <label className="block text-2xs uppercase tracking-widest text-gold mb-2 font-medium">
                  Contraseña Maestra de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoFocus
                    required
                    className="w-full bg-[#0A1B54]/90 border border-gold/30 rounded-xl px-4 py-3.5 text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-gold text-xs transition-colors p-1"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-2xs text-ivory/40">
                  <span>Protección perimetral AES-256</span>
                  <span className="text-gold/80 font-mono">OasisMaster2026!</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-[#0A1B54] font-medium py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                    Validando clave maestra...
                  </>
                ) : (
                  <>
                    Continuar a Verificación 2FA
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: TOTP (Google Authenticator / Apple Passwords) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-[#0A1B54]/70 p-4 rounded-xl border border-gold/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-base">📱</span>
                  <span className="text-xs text-ivory font-semibold">
                    Google Authenticator / Apple Passwords
                  </span>
                </div>
                <p className="text-xs text-ivory/70 leading-relaxed">
                  Digita el código dinámico de <span className="text-gold font-bold">6 dígitos</span> de tu aplicación:
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-2xs text-gold/80 font-mono">
                  <span>Cambia en:</span>
                  <span className="font-bold text-sm text-gold">{secondsRemaining}s</span>
                  {/* Mini animated circular or bar indicator */}
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-center text-2xs uppercase tracking-widest text-gold mb-3 font-medium">
                  Código de 6 Dígitos
                </label>
                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 bg-[#0A1B54] border border-gold/40 rounded-xl text-center text-xl font-bold font-mono text-gold focus:border-gold-light focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => verifyOtpCode(otpDigits.join(''))}
                disabled={loading || otpDigits.some((d) => !d)}
                className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-[#0A1B54] font-medium py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                    Validando sesión...
                  </>
                ) : (
                  'Verificar y Acceder al Dashboard'
                )}
              </button>

              {/* Toggle QR Code & Apple Passwords Setup Section */}
              <div className="border-t border-gold/15 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQrModal(!showQrModal)}
                  className="w-full text-center text-2xs text-gold/80 hover:text-gold flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1"
                >
                  <span>{showQrModal ? '▲ Ocultar vinculación' : '▼ ¿Aún no tienes vinculado el autenticador?'}</span>
                </button>

                {showQrModal && (
                  <div className="mt-4 bg-[#0A1B54] p-4 rounded-xl border border-gold/25 space-y-4 text-center animate-fadeIn">
                    <p className="text-2xs text-ivory/80">
                      Escanea este código QR con la cámara de tu iPhone, Google Authenticator o la app Contraseñas de Apple:
                    </p>

                    {totpQrCode && (
                      <div className="bg-white p-3 rounded-xl inline-block shadow-lg mx-auto">
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
                          className="inline-flex items-center gap-2 bg-[#0D2266] hover:bg-[#1A2E6B] text-gold border border-gold/40 px-3.5 py-2 rounded-xl text-2xs font-semibold uppercase tracking-wider transition-all"
                        >
                          <span>🍏 Configurar en Contraseñas de Apple / Mac</span>
                        </a>
                      </div>
                    )}

                    {/* Manual Secret Key */}
                    <div className="bg-[#08143F] p-3 rounded-lg border border-gold/15 text-left">
                      <div className="text-2xs text-gold uppercase tracking-wider mb-1 font-semibold">
                        Clave de Configuración Manual:
                      </div>
                      <div className="font-mono text-xs text-ivory break-all select-all flex items-center justify-between gap-2">
                        <span>{totpSecret}</span>
                        <button
                          type="button"
                          onClick={copySecretToClipboard}
                          className="text-2xs text-gold hover:text-white border border-gold/30 px-2 py-0.5 rounded shrink-0 cursor-pointer"
                        >
                          {copiedSecret ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-2xs text-ivory/40 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setPassword('')
                      setOtpDigits(['', '', '', '', '', ''])
                    }}
                    className="hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    ← Volver a contraseña maestra
                  </button>
                  <span className="text-gold/50">RFC 6238 TOTP Standard</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-2xs text-ivory/40 mt-6 tracking-wider">
          Compatible con Google Authenticator, Contraseñas de Apple (iOS / macOS), 1Password y Microsoft Authenticator.
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
            <span className="text-xs uppercase tracking-widest">Cargando Seguridad 2FA...</span>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
