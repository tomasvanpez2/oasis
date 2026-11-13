'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { SecurityBadges } from './SecurityBadges'
import {
  APPROVED_SHIPPING_ZONES,
  BOGOTA_LOCALIDADES,
  isValidBogotaLocalidad,
  isOnlyAccessories,
  COORDINADORA_ACCESSORIES_TEXT,
  type ShippingZone,
} from '@/lib/shipping'

// Zod Schema con validación estricta de zonas aprobadas
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
    shippingZoneId: z.string().min(1, 'Debes seleccionar una zona de envío aprobada'),
    city: z.string().min(1, 'Ciudad requerida'),
    localidad: z.string().optional(),
    address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
    notes: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        'Debes aceptar los términos y la política de tratamiento de datos conforme a la ley colombiana para continuar con el pago',
    }),
  })
  .superRefine((data, ctx) => {
    // Si la ciudad es Bogotá, la localidad es obligatoria y debe ser oficial
    if (data.city === 'Bogotá') {
      if (!data.localidad || data.localidad.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes seleccionar la localidad de Bogotá para la coordinación de la entrega',
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

export function CheckoutForm({ onError, onZoneChange, selectedZoneId }: CheckoutFormProps) {
  const {
    items,
    getTotalPrice,
    clearCart,
    shipping,
    shippingZone,
    shippingResolution,
    updateShippingLocation,
    setShippingZone,
  } = useCartStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Determinar reactivamente si el carrito contiene EXCLUSIVAMENTE accesorios
  const onlyAccessories = useMemo(() => isOnlyAccessories(items), [items])

  const initialZoneId = selectedZoneId || shippingZone?.id || 'bogota-grupo-1'

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
      shippingZoneId: initialZoneId,
      city: 'Bogotá',
      localidad: '',
      address: '',
      notes: '',
      acceptTerms: false,
    },
  })

  const watchedZoneId = watch('shippingZoneId')
  const watchedCity = watch('city')
  const watchedLocalidad = watch('localidad')

  // Sincronizar zona seleccionada con ciudad y estado de flete
  useEffect(() => {
    if (watchedZoneId) {
      const foundZone = APPROVED_SHIPPING_ZONES.find((z) => z.id === watchedZoneId)
      if (foundZone) {
        setValue('city', foundZone.city)
        setShippingZone(foundZone)
        if (onZoneChange) {
          onZoneChange(foundZone.id)
        }

        if (foundZone.city !== 'Bogotá') {
          setValue('localidad', '')
          updateShippingLocation(foundZone.city)
        } else if (watchedLocalidad) {
          updateShippingLocation('Bogotá', watchedLocalidad)
        }
      }
    }
  }, [watchedZoneId, setValue, setShippingZone, onZoneChange, updateShippingLocation, watchedLocalidad])

  useEffect(() => {
    if (watchedCity === 'Bogotá' && watchedLocalidad) {
      updateShippingLocation('Bogotá', watchedLocalidad)
    }
  }, [watchedCity, watchedLocalidad, updateShippingLocation])

  const subtotal = getTotalPrice()
  const activeZone: ShippingZone =
    APPROVED_SHIPPING_ZONES.find((z) => z.id === watchedZoneId) ||
    shippingZone ||
    APPROVED_SHIPPING_ZONES[3]

  // Flete: Si es exclusivamente accesorios = $0. Si no, flete 100% de la zona
  const shippingFee = onlyAccessories ? 0 : (typeof shipping === 'number' ? shipping : activeZone.price)
  const isCovered = onlyAccessories ? true : (shippingResolution ? shippingResolution.isCovered : true)
  const grandTotal = subtotal + shippingFee

  // Filtrar localidades de Bogotá según el grupo seleccionado
  const filteredLocalidades = useMemo(() => {
    if (watchedZoneId === 'bogota-grupo-1') {
      return ['Suba', 'Engativá', 'Fontibón', 'Barrios Unidos', 'Teusaquillo', 'Chapinero', 'Usaquén']
    }
    if (watchedZoneId === 'bogota-grupo-2') {
      return [
        'Kennedy',
        'Bosa',
        'Puente Aranda',
        'Los Mártires',
        'Santa Fe',
        'La Candelaria',
        'Antonio Nariño',
        'Tunjuelito',
        'Rafael Uribe Uribe',
        'San Cristóbal',
        'Ciudad Bolívar',
        'Usme',
        'Sumapaz',
      ]
    }
    return BOGOTA_LOCALIDADES
  }, [watchedZoneId])

  const onSubmit = async (data: CustomerFormData) => {
    if (!isCovered && !onlyAccessories) {
      setSubmitError('Por favor selecciona una zona autorizada de entrega para continuar.')
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
            shippingZoneId: onlyAccessories ? 'coordinadora-contra-entrega' : (data.shippingZoneId || activeZone.id),
            shippingZoneName: onlyAccessories ? COORDINADORA_ACCESSORIES_TEXT : activeZone.name,
          },
          items,
          shippingPrice: onlyAccessories ? 0 : shippingFee,
          shippingZone: onlyAccessories
            ? {
                id: 'coordinadora-contra-entrega',
                name: COORDINADORA_ACCESSORIES_TEXT,
                city: data.city,
                price: 0,
                estimatedDays: '2 a 4 días hábiles',
                coverage: 'Cobertura nacional por Coordinadora Mercantil (Pago contra entrega)',
              }
            : activeZone,
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
            Checkout Seguro Oasis
          </p>
          <h2 className="mt-1 font-display text-3xl font-normal text-[#0A1B54]">
            Datos de entrega y facturación
          </h2>
          <p className="mt-2 font-body text-xs text-[#0A1B54]/60">
            {onlyAccessories
              ? 'Despacho asegurado para accesorios. El flete se abona a Coordinadora contra entrega.'
              : 'Flete de transporte liquidado al 100% con Transporte Propio (Origen: Bodega Normandía, Bogotá D.C.).'}
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
          {/* Nombre completo */}
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

          {/* Email + Teléfono */}
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

          {/* Tipo doc + Número */}
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

          {/* ── SELECTOR ESTRICTO DE ZONAS DE ENVÍO HARDCODEADAS APROBADAS ── */}
          <div className="space-y-4">
            <div>
              <label className={LABEL_CLASS}>
                Zona de Envío Aprobada (Transporte Propio) *
              </label>
              <div className="relative">
                <select
                  id="shippingZoneId"
                  {...register('shippingZoneId')}
                  className={SELECT_CLASS}
                  disabled={isSubmitting}
                >
                  <option value="" disabled className="text-[#0A1B54]/40">
                    Selecciona una zona de envío autorizada
                  </option>
                  {/* Restricción estricta: Únicamente las zonas aprobadas del documento fuente existen como option */}
                  {APPROVED_SHIPPING_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatCOP(zone.price)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1B54]/40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              {errors.shippingZoneId && <p className={ERROR_CLASS}>{errors.shippingZoneId.message}</p>}
            </div>

            {/* Selector Condicional de Localidad para Bogotá */}
            <AnimatePresence mode="wait">
              {activeZone.city === 'Bogotá' && (
                <motion.div
                  key="localidad-selector"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
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
                        Selecciona tu localidad
                      </option>
                      {filteredLocalidades.map((loc) => (
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

          {/* ── HUD LOGÍSTICA QUIET LUXURY: ACCESORIOS O TRANSPORTE PROPIO ── */}
          <div className="border border-[#C5A059]/40 bg-[#FAF9F7] p-5 space-y-4 rounded transition-all duration-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <label className="block font-body text-xs uppercase tracking-[0.18em] text-[#0A1B54] font-semibold">
                  {onlyAccessories ? 'Despacho Coordinadora (Accesorios)' : 'Cálculo Oficial Transporte Propio'}
                </label>
              </div>
              <span className="font-mono text-[10px] border border-[#C5A059]/60 bg-[#C5A059]/10 px-2 py-0.5 text-[#0A1B54] uppercase tracking-wider font-medium">
                {onlyAccessories ? 'Pago Contra Entrega' : 'Tarifa 100% Transparente'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${onlyAccessories ? 'acc' : activeZone.id}-${shippingFee}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {onlyAccessories ? (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[#0A1B54]/10 pb-3">
                      <div>
                        <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                          Modalidad de entrega:
                        </span>
                        <p className="font-display text-base text-[#0A1B54] font-medium">
                          {COORDINADORA_ACCESSORIES_TEXT}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="font-body text-2xs uppercase tracking-wider text-[#0A1B54]/50 block">
                          Costo inyectado al total:
                        </span>
                        <span className="font-display text-lg text-[#0A1B54] font-medium">
                          $0 COP
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 font-body text-[11px] text-[#0A1B54]/70 leading-relaxed">
                      Tu pedido contiene exclusivamente accesorios. El valor del envío nacional es liquidado y abonado directamente a Coordinadora Mercantil al momento de recibir la mercancía.
                    </p>
                  </div>
                ) : (
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
                          Flete oficial (100% cliente):
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
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dirección exacta */}
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

          {/* Notas */}
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

          {/* Garantía Logística */}
          <div className="border border-[#0A1B54]/15 bg-[#FAF9F7] p-4 flex items-start gap-3">
            <span className="text-[#C5A059] text-base">{onlyAccessories ? '📦' : '🚛'}</span>
            <p className="font-body text-xs text-[#0A1B54]/80 leading-relaxed">
              {onlyAccessories ? (
                <>
                  <strong>Despacho de Accesorios:</strong> Tu pedido viaja asegurado con empaque sellado de fábrica vía Coordinadora Mercantil bajo modalidad de pago contra entrega.
                </>
              ) : (
                <>
                  <strong>Despacho Oficial con Transporte Propio:</strong> El costo de transporte oficial ({formatCOP(activeZone.price)}) se cobra al 100% de manera transparente en tu liquidación en Wompi. Tu colchón viaja con cuadrilla y flota propia desde nuestra planta en Normandía, Bogotá D.C.
                </>
              )}
            </p>
          </div>

          {/* Checkbox de Términos y Habeas Data */}
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
                de Oasis Colchones y Muebles. Autorizo el tratamiento de mis datos personales para la emisión de factura electrónica y coordinación del despacho.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className={ERROR_CLASS + ' mt-1.5'}>{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Botón de Pago Wompi */}
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0 || (!isCovered && !onlyAccessories)}
            className="w-full border border-[#0A1B54] bg-[#0A1B54] py-4 font-body text-xs uppercase tracking-widest text-white font-semibold transition-all duration-300 hover:bg-[#07133B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirigiendo a pasarela segura Wompi...
              </span>
            ) : (
              `Pagar Orden Segura con Wompi • ${formatCOP(grandTotal)}`
            )}
          </button>

          <SecurityBadges />
        </form>
      </motion.div>
    </div>
  )
}
