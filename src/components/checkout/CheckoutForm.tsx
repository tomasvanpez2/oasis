'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import {
  SHIPPING_ZONES,
  getShippingZoneById,
  getDefaultShippingZone,
  COORDINADORA_ORIGIN,
  type ShippingZone,
} from '@/lib/shipping'
import { formatCOP } from '@/lib/utils'
import { SecurityBadges } from './SecurityBadges'

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
  shippingZoneId: z.string().min(1, 'Selecciona la zona de entrega para liquidar el envío con Coordinadora'),
  city: z.string().min(3, 'Indica la ciudad o municipio de destino en Colombia'),
  address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
  notes: z.string().optional(),
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

export function CheckoutForm({ onError, selectedZoneId = 'bogota-centro-occidente', onZoneChange }: CheckoutFormProps) {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const defaultZone = getDefaultShippingZone()
  const [currentZoneId, setCurrentZoneId] = useState<string>(selectedZoneId || defaultZone.id)

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
      shippingZoneId: selectedZoneId || defaultZone.id,
      city: '',
      address: '',
      notes: '',
      acceptTerms: true,
    },
  })

  const watchedZoneId = watch('shippingZoneId')

  useEffect(() => {
    if (watchedZoneId && watchedZoneId !== currentZoneId) {
      setCurrentZoneId(watchedZoneId)
      onZoneChange?.(watchedZoneId)
    }
  }, [watchedZoneId, currentZoneId, onZoneChange])

  const activeZone: ShippingZone =
    getShippingZoneById(currentZoneId) || defaultZone

  const subtotal = getTotalPrice()
  const shippingFee = activeZone.price
  const grandTotal = subtotal + shippingFee

  // Group zones for clean luxury combobox presentation
  const groupedZones = {
    'Bogotá D.C. (Salida Normandía)': SHIPPING_ZONES.filter((z) => z.group === 'Bogotá Urbana'),
    'Cundinamarca & Sabana': SHIPPING_ZONES.filter((z) => z.group === 'Cundinamarca & Cercanías'),
    'Regiones Principales': SHIPPING_ZONES.filter((z) => z.group === 'Regiones Principales'),
    'Cobertura Nacional & Periferia': SHIPPING_ZONES.filter((z) => z.group === 'Cobertura Nacional & Periferia'),
  }

  async function onSubmit(data: CustomerFormData) {
    if (items.length === 0) {
      setSubmitError('El carrito se encuentra vacío.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const selectedShipping = getShippingZoneById(data.shippingZoneId) || defaultZone
      const calculatedShippingFee = selectedShipping.price
      const totalToCharge = getTotalPrice() + calculatedShippingFee

      // Dispatch order initialization to our backend
      // Backend signs amountInCents (Math.round(totalToCharge * 100)) with WOMPI_INTEGRITY_SECRET
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
            address: data.address,
            notes: data.notes,
            shippingZoneId: selectedShipping.id,
            shippingZoneName: selectedShipping.name,
          },
          items,
          shippingZone: selectedShipping.name,
          subtotal: getTotalPrice(),
          shipping: calculatedShippingFee,
          total: totalToCharge,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || 'No fue posible iniciar la sesión de pago con Wompi.')
      }

      // Clear local shopping bag before redirect
      clearCart()

      // Redirect user directly to the official Wompi Hosted Checkout (0% PCI Scope)
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
            Flete de transporte liquidado en tiempo real con Coordinadora Mercantil (Origen: Bodega Normandía, Bogotá D.C.).
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

          {/* ── LOGÍSTICA DE ENVÍO: SELECTOR OBLIGATORIO DE 15 ZONAS ─────── */}
          <div className="border border-[#C5A059]/40 bg-[#07133B]/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-body text-xs uppercase tracking-[0.18em] text-[#C5A059] font-medium">
                  Zona de Despacho Coordinadora (15 Zonas) *
                </label>
                <p className="mt-0.5 font-body text-2xs text-white/50">
                  Calculado para colchón desde bodega central en Normandía, Bogotá D.C.
                </p>
              </div>
              <span className="font-mono text-2xs border border-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 text-[#C5A059]">
                Tarifa Oficial
              </span>
            </div>

            <div>
              <select
                {...register('shippingZoneId')}
                className={SELECT_CLASS + ' border-[#C5A059]/50 text-white font-medium'}
                disabled={isSubmitting}
                onChange={(e) => {
                  setValue('shippingZoneId', e.target.value, { shouldValidate: true })
                  setCurrentZoneId(e.target.value)
                  onZoneChange?.(e.target.value)
                }}
              >
                {Object.entries(groupedZones).map(([groupName, zones]) => (
                  <optgroup key={groupName} label={groupName} className="bg-[#0A1B54] text-white/80 font-semibold py-1">
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id} className="bg-[#07133B] text-white py-1">
                        {zone.name} — {formatCOP(zone.price)} ({zone.estimatedDays})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.shippingZoneId && (
                <p className={ERROR_CLASS}>{errors.shippingZoneId.message}</p>
              )}
            </div>

            {/* Active Zone Detail HUD */}
            <div className="border-t border-white/10 pt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-2xs">
              <div>
                <span className="text-white/40 block uppercase tracking-wider">Costo de Transporte:</span>
                <span className="font-display text-sm text-[#C5A059] font-medium">
                  {formatCOP(activeZone.price)} COP
                </span>
              </div>
              <div>
                <span className="text-white/40 block uppercase tracking-wider">Tiempo de Entrega:</span>
                <span className="text-white font-medium">{activeZone.estimatedDays}</span>
              </div>
              <div>
                <span className="text-white/40 block uppercase tracking-wider">Cobertura Principal:</span>
                <span className="text-white/70 block truncate" title={activeZone.coverage}>
                  {activeZone.coverage}
                </span>
              </div>
            </div>
          </div>

          {/* City / Municipality */}
          <div>
            <label className={LABEL_CLASS}>Ciudad o municipio específico</label>
            <input
              {...register('city')}
              className={INPUT_CLASS}
              placeholder="Ej. Bogotá D.C., Chía, Medellín, Cali, Tunja, Bucaramanga..."
              autoComplete="address-level2"
              disabled={isSubmitting}
            />
            {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className={LABEL_CLASS}>Dirección exacta y especificaciones de nomenclatura</label>
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
              <strong>Despacho Oficial con Coordinadora Mercantil:</strong> El costo de transporte seleccionado ({formatCOP(activeZone.price)}) se suma de forma directa al total a pagar en Wompi. Tu colchón viaja con guía oficial asegurada desde nuestra planta en Normandía, Bogotá D.C.
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
                Acepto los términos de compra directa de fábrica y confirmo que la dirección y zona de entrega seleccionada para el despacho con Coordinadora Mercantil son correctas.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className={ERROR_CLASS}>{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full border border-[#C5A059] bg-[#C5A059] py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-white hover:border-white hover:text-[#0A1B54] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                Redirigiendo a pasarela segura Wompi...
              </span>
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
