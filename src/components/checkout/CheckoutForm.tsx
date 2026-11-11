'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { SecurityBadges } from './SecurityBadges'
import {
  ALLOWED_CITIES,
  BOGOTA_LOCALIDADES,
  isValidBogotaLocalidad,
  type ShippingZone,
} from '@/lib/shipping'

const customerSchema = z
  .object({
    fullName: z.string().min(3, 'Nombre completo requerido (mínimo 3 caracteres)'),
    email: z.string().email('Ingresa un correo electrónico válido'),
    phone: z
      .string()
      .min(10, 'Número de celular colombiano de 10 dígitos (ej. 3001234567)')
      .max(15, 'Máximo 15 dígitos')
      .regex(/^[0-9+ ]+$/, 'Solo números y espacios'),
    documentType: z.enum(['CC', 'CE', 'NIT', 'PP']),
    document: z.string().min(6, 'Número de documento válido (mínimo 6 dígitos)'),
    city: z.enum(ALLOWED_CITIES, {
      errorMap: () => ({ message: 'Debes seleccionar una ciudad válida (Cota, Chía, Cajicá o Bogotá)' }),
    }),
    localidad: z.string().optional(),
    address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
    notes: z.string().optional(),
    shippingZoneId: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        'Debes aceptar los términos y la política de tratamiento de datos conforme a la ley colombiana para continuar con el pago',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.city === 'Bogotá') {
      if (!data.localidad || data.localidad.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes seleccionar la localidad de Bogotá para liquidar el flete de Transporte Propio',
          path: ['localidad'],
        })
      } else if (!isValidBogotaLocalidad(data.localidad)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes seleccionar una de las 20 localidades oficiales de Bogotá',
          path: ['localidad'],
        })
      }
    }
  })

type CustomerFormData = z.infer<typeof customerSchema>

interface CheckoutFormProps {
  onError: () => void
  selectedZoneId?: string
  onZoneChange?: (zoneId: string) => void
}

const INPUT_CLASS =
  'w-full border border-[#0A1B54]/20 bg-white px-4 py-3.5 font-body text-sm text-[#0A1B54] placeholder-[#0A1B54]/30 outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50'

const SELECT_CLASS =
  'w-full appearance-none border border-[#0A1B54]/20 bg-white px-4 py-3.5 font-body text-sm text-[#0A1B54] outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50 cursor-pointer'

const LABEL_CLASS = 'block font-body text-2xs uppercase tracking-[0.18em] text-[#0A1B54]/60 mb-2 font-medium'
const ERROR_CLASS = 'mt-1.5 font-body text-xs text-red-500 font-light'

export function CheckoutForm({ onError, onZoneChange }: CheckoutFormProps) {
  const {
    items,
    getTotalPrice,
    clearCart,
    shipping,
    shippingZone,
    shippingResolution,
    updateShippingLocation,
  } = useCartStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      documentType: 'CC',
      document: '',
      city: undefined,
      localidad: '',
      address: '',
      notes: '',
      shippingZoneId: shippingZone?.id || 'bogota-grupo-1',
      acceptTerms: false,
    },
  })

  const watchedCity = watch('city')
  const watchedLocalidad = watch('localidad')

  useEffect(() => {
    if (watchedCity) {
      const isBogota = watchedCity === 'Bogotá'
      const loc = isBogota ? watchedLocalidad || '' : undefined

      if (!isBogota || (isBogota && watchedLocalidad)) {
        updateShippingLocation(watchedCity, loc)
      }
    }
  }, [watchedCity, watchedLocalidad, updateShippingLocation])

  useEffect(() => {
    if (watchedCity && watchedCity !== 'Bogotá') {
      setValue('localidad', '')
    }
  }, [watchedCity, setValue])

  useEffect(() => {
    if (shippingZone?.id) {
      setValue('shippingZoneId', shippingZone.id)
      if (onZoneChange) {
        onZoneChange(shippingZone.id)
      }
    }
  }, [shippingZone, setValue, onZoneChange])

  const subtotal = getTotalPrice()
  const activeZone: ShippingZone = shippingZone || {
    id: 'bogota-grupo-1',
    name: 'Bogotá (Zona Principal)',
    price: 30000,
    cities: ['Bogotá'],
    description: 'Tarifa inicial para localidades base de Bogotá D.C.',
  }
  const shippingFee = typeof shipping === 'number' ? shipping : activeZone.price
  const isCovered = shippingResolution ? shippingResolution.isCovered : false
  const grandTotal = isCovered ? subtotal + shippingFee : subtotal

  const onSubmit = async (data: CustomerFormData) => {
    if (!isCovered) {
      setSubmitError('Por favor selecciona una ciudad y localidad con cobertura para continuar.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/wompi-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            documentType: data.documentType,
            document: data.document,
            city: data.city,
            localidad: data.localidad,
            address: data.address,
            notes: data.notes,
            shippingZoneId: data.shippingZoneId || activeZone.id,
            shippingZoneName: activeZone.name,
          },
          items,
          shippingPrice: shippingFee,
          shippingZone: activeZone,
        }),
      })

      const resData = await response.json()

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Error al procesar el checkout')
      }

      const { reference, checkoutUrl, widgetData } = resData

      if (checkoutUrl) {
        clearCart()
        window.location.href = checkoutUrl
        return
      }

      if (typeof window !== 'undefined') {
        const win = window as unknown as {
          WidgetCheckout?: new (config: Record<string, unknown>) => {
            open: (cb: (result: { transaction?: { id?: string; status?: string } }) => void) => void
          }
        }
        if (win.WidgetCheckout && widgetData) {
          const checkout = new win.WidgetCheckout({
            currency: 'COP',
            amountInCents: widgetData.amountInCents,
            reference: widgetData.reference,
            publicKey: widgetData.publicKey,
            signature: { integrity: widgetData.signatureIntegrity },
            redirectUrl: widgetData.redirectUrl,
            customerData: {
              email: data.email,
              fullName: data.fullName,
              phoneNumber: data.phone,
              legalId: data.document,
              legalIdType: data.documentType,
            },
            shippingAddress: {
              addressLine1: data.address,
              city: data.city,
              country: 'CO',
              phoneNumber: data.phone,
            },
          })

          checkout.open((result) => {
            if (result.transaction) {
              clearCart()
              window.location.href = `/checkout/success?reference=${reference}&id=${result.transaction.id}`
            }
          })
          return
        }
      }

      window.location.href = `/checkout/success?reference=${reference}&simulated=true`
    } catch (err) {
      console.error('[checkout:error]', err)
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado de comunicación.')
      setIsSubmitting(false)
      onError()
    }
  }

  return (
    <div className="max-w-2xl text-[#0A1B54]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Checkout Seguro Directo de Fábrica
          </p>
          <h2 className="mt-1 font-display text-3xl font-normal text-[#0A1B54]">
            Datos de entrega y facturación
          </h2>
          <p className="mt-2 font-body text-xs text-[#0A1B54]/60">
            Flete de transporte liquidado automáticamente con Transporte Propio (Origen Oficial: Bodega Normandía, Bogotá D.C.).
          </p>
        </div>

        {submitError && (
          <div className="mt-6 border border-red-500/40 bg-red-50 p-4">
            <p className="font-body text-xs text-red-600">
              <strong>Atención:</strong> {submitError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className={LABEL_CLASS}>Nombre completo del titular *</label>
            <input
              {...register('fullName')}
              className={INPUT_CLASS}
              placeholder="Ej. Juan Manuel Galán"
              autoComplete="name"
              disabled={isSubmitting}
            />
            {errors.fullName && <p className={ERROR_CLASS}>{errors.fullName.message}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Correo electrónico *</label>
              <input
                {...register('email')}
                type="email"
                className={INPUT_CLASS}
                placeholder="comprador@ejemplo.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && <p className={ERROR_CLASS}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={LABEL_CLASS}>Teléfono celular (Colombia) *</label>
              <input
                {...register('phone')}
                type="tel"
                className={INPUT_CLASS}
                placeholder="300 123 4567"
                autoComplete="tel"
                disabled={isSubmitting}
              />
              {errors.phone && <p className={ERROR_CLASS}>{errors.phone.message}</p>}
            </div>
          </div>

          {/* Document type + number */}
          <div className="grid grid-cols-[130px_1fr] gap-4">
            <div>
              <label className={LABEL_CLASS}>Tipo doc. *</label>
              <div className="relative">
                <select
                  {...register('documentType')}
                  className={SELECT_CLASS}
                  disabled={isSubmitting}
                >
                  <option value="CC">C.C. Cédula</option>
                  <option value="CE">C.E. Extranjería</option>
                  <option value="NIT">NIT Empresa</option>
                  <option value="PP">Pasaporte</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1B54]/40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Número de identificación *</label>
              <input
                {...register('document')}
                className={INPUT_CLASS}
                placeholder="1020304050"
                disabled={isSubmitting}
              />
              {errors.document && <p className={ERROR_CLASS}>{errors.document.message}</p>}
            </div>
          </div>

          {/* CIUDAD Y SELECTOR CONDICIONAL DE LOCALIDAD */}
          <div className="space-y-4">
            <div className={`grid grid-cols-1 gap-4 ${watchedCity === 'Bogotá' ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
              {/* Selector Ciudad */}
              <div>
                <label className={LABEL_CLASS}>Ciudad de Entrega (Transporte Propio) *</label>
                <div className="relative">
                  <select
                    {...register('city')}
                    className={SELECT_CLASS}
                    disabled={isSubmitting}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-[#0A1B54]/40">
                      Selecciona una ciudad
                    </option>
                    {ALLOWED_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1B54]/40">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
                {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
              </div>

              {/* Selector Condicional de Localidad para Bogotá */}
              <AnimatePresence mode="wait">
                {watchedCity === 'Bogotá' && (
                  <motion.div
                    key="localidad-selector"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <label className={LABEL_CLASS}>Localidad Oficial de Bogotá *</label>
                    <div className="relative">
                      <select
                        {...register('localidad')}
                        className={SELECT_CLASS}
                        disabled={isSubmitting}
                        defaultValue=""
                      >
                        <option value="" disabled className="text-[#0A1B54]/40">
                          Selecciona una de las 20 localidades
                        </option>
                        {BOGOTA_LOCALIDADES.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1B54]/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                    {errors.localidad && <p className={ERROR_CLASS}>{errors.localidad.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* HUD TRANSPORTE PROPIO */}
          <div className="border border-[#C5A059]/40 bg-[#FAF9F7] p-5 space-y-4 rounded transition-all duration-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <label className="block font-body text-xs uppercase tracking-[0.18em] text-[#0A1B54] font-semibold">
                  Cálculo Oficial Transporte Propio
                </label>
              </div>
              <span className="font-mono text-[10px] border border-[#C5A059]/60 bg-[#C5A059]/10 px-2 py-0.5 text-[#0A1B54] uppercase tracking-wider font-medium">
                Tarifa Blindada
              </span>
            </div>

            {/* Display de solo lectura animado con Framer Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeZone.id}-${shippingFee}-${isCovered}-${watchedCity}-${watchedLocalidad}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {isCovered ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[#0A1B54]/10 pb-3">
                      <div>
                        <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                          Zona de despacho asignada:
                        </span>
                        <p className="font-display text-base text-[#0A1B54] font-medium">
                          Flete Transporte Propio ({activeZone.name}) — {formatCOP(activeZone.price)} COP
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                          Tarifa liquidada:
                        </span>
                        <span className="font-display text-lg text-[#C5A059] font-medium">
                          {formatCOP(activeZone.price)} COP
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-2xs">
                      <div>
                        <span className="text-[#0A1B54]/50 block uppercase tracking-wider">Tiempo de Entrega:</span>
                        <span className="text-[#0A1B54] font-medium">Entrega coordinada por mensaje</span>
                      </div>
                      <div>
                        <span className="text-[#0A1B54]/50 block uppercase tracking-wider">Origen de Bodega:</span>
                        <span className="text-[#0A1B54]/70 block">Normandía, Bogotá D.C.</span>
                      </div>
                      <div>
                        <span className="text-[#0A1B54]/50 block uppercase tracking-wider">Estado del Despacho:</span>
                        <span className="text-[#0A1B54] font-semibold">
                          ✓ Flota Propia Directa
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border border-[#0A1B54]/10 bg-white p-3 rounded">
                    <p className="font-body text-xs text-[#0A1B54]/80 font-medium">
                      {watchedCity === 'Bogotá' && !watchedLocalidad
                        ? '📍 Selecciona tu localidad de Bogotá para liquidar la tarifa exacta.'
                        : '📍 Selecciona tu ciudad de destino para liquidar el flete de Transporte Propio.'}
                    </p>
                    <p className="mt-1 font-body text-2xs text-[#0A1B54]/50">
                      Cobertura autorizada con flota propia en Cota, Chía, Cajicá y las 20 localidades oficiales de Bogotá D.C.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Address */}
          <div>
            <label className={LABEL_CLASS}>Dirección exacta y nomenclatura de entrega *</label>
            <input
              {...register('address')}
              className={INPUT_CLASS}
              placeholder="Calle / Carrera / Avenida, Número, Interior, Apto o Casa"
              autoComplete="street-address"
              disabled={isSubmitting}
            />
            {errors.address && <p className={ERROR_CLASS}>{errors.address.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL_CLASS}>Notas para la cuadrilla de despacho en bodega (opcional)</label>
            <textarea
              {...register('notes')}
              className={INPUT_CLASS + ' resize-none'}
              rows={2}
              placeholder="Dimensiones de escaleras, piso del inmueble, ascensor de carga, indicaciones especiales..."
              disabled={isSubmitting}
            />
          </div>

          {/* Logistics Assurance Banner */}
          <div className="border border-[#0A1B54]/15 bg-[#FAF9F7] p-4 flex items-start gap-3">
            <span className="text-[#C5A059] text-base">🚛</span>
            <p className="font-body text-xs text-[#0A1B54]/80 leading-relaxed">
              <strong>Despacho Oficial con Transporte Propio:</strong> El costo de transporte oficial ({formatCOP(activeZone.price)}) se liquida de forma automática y se transfiere de manera transparente al total a pagar en Wompi. Tu colchón viaja con cuadrilla y flota propia desde nuestra planta en Normandía, Bogotá D.C.
            </p>
          </div>

          {/* Terms and Colombian Legal Consent checkbox */}
          <div className="pt-2 border-t border-[#0A1B54]/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-1 h-4 w-4 rounded-none border border-[#0A1B54]/30 bg-white text-[#0A1B54] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <span className="font-body text-xs text-[#0A1B54]/75 leading-relaxed select-none">
                He leído y acepto los{' '}
                <a
                  href="/legales?tab=terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1B54] font-medium underline hover:text-[#C5A059] transition-colors"
                >
                  Términos y Condiciones Generales
                </a>
                , la{' '}
                <a
                  href="/legales?tab=datos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1B54] font-medium underline hover:text-[#C5A059] transition-colors"
                >
                  Política de Tratamiento de Datos Personales (Ley 1581 de 2012 / Habeas Data)
                </a>{' '}
                y la{' '}
                <a
                  href="/legales?tab=fraude"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1B54] font-medium underline hover:text-[#C5A059] transition-colors"
                >
                  Política de Prevención de Fraude y Devolución
                </a>{' '}
                de Oasis Colchones y Muebles. Autorizo el tratamiento de mis datos personales para la emisión de factura electrónica y coordinación del despacho con Transporte Propio.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className={ERROR_CLASS + ' mt-1.5'}>{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0 || !isCovered}
            className="w-full border border-[#0A1B54] bg-[#0A1B54] py-4 font-body text-xs uppercase tracking-widest text-white font-semibold transition-all duration-300 hover:bg-[#07133B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirigiendo a pasarela segura Wompi...
              </span>
            ) : !isCovered ? (
              watchedCity === 'Bogotá' && !watchedLocalidad
                ? 'Selecciona una Localidad para continuar'
                : 'Selecciona una Ciudad de entrega'
            ) : (
              `Pagar Orden Segura con Wompi • ${formatCOP(grandTotal)}`
            )}
          </button>

          {/* Official Security Badges */}
          <SecurityBadges />
        </form>
      </motion.div>
    </div>
  )
}
