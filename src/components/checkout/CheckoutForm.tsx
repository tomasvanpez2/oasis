'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatCOP } from '@/lib/utils'
import { SecurityBadges } from './SecurityBadges'
import type { ShippingZone } from '@/lib/shipping'

const customerSchema = z.object({
  fullName: z.string().min(3, 'Nombre completo requerido (mínimo 3 caracteres)'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  phone: z
    .string()
    .min(10, 'Número de celular colombiano de 10 dígitos (ej. 3001234567)')
    .max(15, 'Máximo 15 dígitos')
    .regex(/^[0-9+ ]+$/, 'Solo números y espacios'),
  documentType: z.enum(['CC', 'CE', 'NIT', 'PP']),
  document: z.string().min(6, 'Número de documento válido (mínimo 6 dígitos)'),
  city: z.string().min(2, 'Indica la ciudad o municipio de destino en Colombia'),
  department: z.string().optional(),
  address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
  notes: z.string().optional(),
  shippingZoneId: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y la política de despacho asegurado' }),
  }),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CheckoutFormProps {
  onError: () => void
  selectedZoneId?: string
  onZoneChange?: (zoneId: string) => void
}

const INPUT_CLASS =
  'w-full border border-white/20 bg-transparent px-4 py-3.5 font-body text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50'

const SELECT_CLASS =
  'w-full border border-white/20 bg-[#0A1B54] px-4 py-3.5 font-body text-sm text-white outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50 cursor-pointer'

const LABEL_CLASS = 'block font-body text-2xs uppercase tracking-[0.18em] text-white/50 mb-2'
const ERROR_CLASS = 'mt-1.5 font-body text-xs text-red-400 font-light'

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
      city: '',
      department: '',
      address: '',
      notes: '',
      shippingZoneId: shippingZone?.id || 'bogota-centro-occidente',
      acceptTerms: true,
    },
  })

  // Escuchar en tiempo real los cambios en ciudad y departamento
  const watchedCity = watch('city')
  const watchedDepartment = watch('department')

  useEffect(() => {
    // Cruce automático con la matriz de Coordinadora cada vez que el usuario escribe
    const res = updateShippingLocation(watchedCity || '', watchedDepartment || '')
    setValue('shippingZoneId', res.zone.id)
    onZoneChange?.(res.zone.id)
  }, [watchedCity, watchedDepartment, updateShippingLocation, setValue, onZoneChange])

  const isCovered = shippingResolution ? shippingResolution.isCovered : true
  const activeZone: ShippingZone = shippingZone
  const subtotal = getTotalPrice()
  const shippingFee = isCovered ? shipping : 0
  const grandTotal = subtotal + shippingFee

  async function onSubmit(data: CustomerFormData) {
    if (items.length === 0) {
      setSubmitError('El carrito se encuentra vacío.')
      return
    }

    if (!isCovered) {
      setSubmitError(
        'El destino ingresado se encuentra fuera de cobertura. Coordinadora Mercantil despacha únicamente dentro de Colombia.'
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Arquitectura Zero-Trust: Enviamos los datos del cliente y los ítems.
      // El backend recalcula y valida el flete de forma obligatoria en el servidor.
      const response = await fetch('/api/wompi-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            documentType: data.documentType,
            document: data.document,
            city: data.city,
            department: data.department || '',
            address: data.address,
            notes: data.notes,
            shippingZoneId: activeZone.id,
            shippingZoneName: activeZone.name,
          },
          items,
          shippingZone: activeZone.name,
          subtotal,
          shipping: shippingFee,
          total: grandTotal,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || 'No fue posible iniciar la sesión de pago con Wompi.')
      }

      // Limpiar el carrito local antes de la redirección
      clearCart()

      // Redirigir directamente al Web Checkout oficial alojado por Wompi (0% PCI Scope)
      window.location.href = result.checkoutUrl
    } catch (err) {
      console.error('[checkout:error]', err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al conectar con Wompi. Por favor intenta nuevamente.'
      )
      setIsSubmitting(false)
      onError()
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Checkout Seguro Directo de Fábrica
          </p>
          <h2 className="mt-1 font-display text-3xl font-normal text-white">
            Datos de entrega y facturación
          </h2>
          <p className="mt-2 font-body text-xs text-white/50">
            Flete de transporte liquidado automáticamente con Coordinadora Mercantil (Origen Oficial: Bodega Normandía, Bogotá D.C.).
          </p>
        </div>

        {submitError && (
          <div className="mt-6 border border-red-500/40 bg-red-950/30 p-4">
            <p className="font-body text-xs text-red-300">
              <strong>Atención:</strong> {submitError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className={LABEL_CLASS}>Nombre completo del titular</label>
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
              <label className={LABEL_CLASS}>Correo electrónico</label>
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
              <label className={LABEL_CLASS}>Teléfono celular (Colombia)</label>
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
              <label className={LABEL_CLASS}>Tipo doc.</label>
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
            </div>
            <div>
              <label className={LABEL_CLASS}>Número de identificación</label>
              <input
                {...register('document')}
                className={INPUT_CLASS}
                placeholder="1020304050"
                disabled={isSubmitting}
              />
              {errors.document && <p className={ERROR_CLASS}>{errors.document.message}</p>}
            </div>
          </div>

          {/* ── CIUDAD Y DEPARTAMENTO CON CRUCE AUTOMÁTICO EN TIEMPO REAL ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_1fr]">
            <div>
              <label className={LABEL_CLASS}>Ciudad o Municipio de Entrega *</label>
              <input
                {...register('city')}
                className={INPUT_CLASS}
                placeholder="Ej. Bogotá, Medellín, Cali, Cartagena, Chía, Tunja..."
                autoComplete="address-level2"
                disabled={isSubmitting}
              />
              {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
            </div>
            <div>
              <label className={LABEL_CLASS}>Departamento (Opcional)</label>
              <input
                {...register('department')}
                className={INPUT_CLASS}
                placeholder="Ej. Cundinamarca, Antioquia, Valle..."
                autoComplete="address-level1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* ── HUD COORDINADORA: RENDERIZACIÓN ELEGANTE DE SOLO LECTURA (QUIET LUXURY) ── */}
          <div className="border border-[#C5A059]/40 bg-[#07133B]/80 p-5 space-y-4 rounded transition-all duration-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <label className="block font-body text-xs uppercase tracking-[0.18em] text-[#C5A059] font-medium">
                  Cálculo Oficial Coordinadora Mercantil
                </label>
              </div>
              <span className="font-mono text-[10px] border border-[#C5A059]/60 bg-[#C5A059]/10 px-2 py-0.5 text-[#C5A059] uppercase tracking-wider">
                Automático
              </span>
            </div>

            {/* Display de solo lectura animado con Framer Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeZone.id}-${shippingFee}-${isCovered}-${watchedCity}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {isCovered ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-white/10 pb-3">
                      <div>
                        <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                          Zona de despacho asignada:
                        </span>
                        <p className="font-display text-base text-white font-medium">
                          Flete Coordinadora ({activeZone.name}) — {formatCOP(activeZone.price)} COP
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                          Tarifa liquidada:
                        </span>
                        <span className="font-display text-lg text-[#C5A059] font-medium">
                          {formatCOP(activeZone.price)} COP
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-2xs">
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider">Tiempo Estimado:</span>
                        <span className="text-white font-medium">{activeZone.estimatedDays}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider">Origen de Bodega:</span>
                        <span className="text-white/70 block">Normandía, Bogotá D.C.</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase tracking-wider">Estado del Cruce:</span>
                        {shippingResolution?.matchedBy === 'specific_city' && (
                          <span className="text-[#C5A059] font-medium">
                            ✓ Coincidencia exacta ({shippingResolution.matchedTerm || watchedCity})
                          </span>
                        )}
                        {shippingResolution?.matchedBy === 'national_fallback' && (
                          <span className="text-white/80 font-medium">
                            ✓ Tarifa Nacional Coordinadora
                          </span>
                        )}
                        {(!shippingResolution || shippingResolution.matchedBy === 'default_origin') && (
                          <span className="text-white/50">
                            • Estimado inicial — Escribe tu ciudad
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border border-red-500/30 bg-red-950/20 p-3 rounded">
                    <p className="font-body text-xs text-red-300 font-medium">
                      ⚠️ Destino fuera de cobertura nacional
                    </p>
                    <p className="mt-1 font-body text-2xs text-red-200/70">
                      Coordinadora Mercantil realiza despachos exclusivamente en municipios dentro de Colombia. Por favor ingresa una ciudad o municipio colombiano válido.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Address */}
          <div>
            <label className={LABEL_CLASS}>Dirección exacta y nomenclatura de entrega</label>
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
            <label className={LABEL_CLASS}>Notas para el equipo de despacho en bodega (opcional)</label>
            <textarea
              {...register('notes')}
              className={INPUT_CLASS + ' resize-none'}
              rows={2}
              placeholder="Dimensiones de escaleras, piso del inmueble, ascensor de carga, indicaciones especiales..."
              disabled={isSubmitting}
            />
          </div>

          {/* Logistics Assurance Banner */}
          <div className="border border-white/15 bg-white/5 p-4 flex items-start gap-3">
            <span className="text-[#C5A059] text-base">🚛</span>
            <p className="font-body text-xs text-white/70 leading-relaxed">
              <strong>Despacho Oficial con Coordinadora Mercantil:</strong> El costo de transporte oficial ({formatCOP(activeZone.price)}) se liquida de forma automática y se transfiere de manera transparente al total a pagar en Wompi. Tu colchón viaja con guía oficial asegurada desde nuestra planta en Normandía, Bogotá D.C.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-1 h-4 w-4 rounded-none border border-white/30 bg-transparent text-[#C5A059] focus:ring-0 focus:ring-offset-0"
                disabled={isSubmitting}
              />
              <span className="font-body text-xs text-white/60 leading-relaxed select-none">
                Acepto los términos de compra directa de fábrica y confirmo que la dirección de entrega ingresada para el despacho con Coordinadora Mercantil es correcta.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className={ERROR_CLASS}>{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0 || !isCovered}
            className="w-full border border-[#C5A059] bg-[#C5A059] py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-white hover:border-white hover:text-[#0A1B54] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                Redirigiendo a pasarela segura Wompi...
              </span>
            ) : !isCovered ? (
              'Destino sin cobertura nacional'
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
