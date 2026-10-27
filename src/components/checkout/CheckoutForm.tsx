'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
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
  city: z.string().min(3, 'Indica la ciudad o municipio de destino en Colombia'),
  address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
  notes: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y la política de flete directo' }),
  }),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CheckoutFormProps {
  onError: () => void
}

const INPUT_CLASS =
  'w-full border border-white/20 bg-transparent px-4 py-3.5 font-body text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50'

const LABEL_CLASS = 'block font-body text-2xs uppercase tracking-[0.18em] text-white/50 mb-2'
const ERROR_CLASS = 'mt-1.5 font-body text-xs text-red-400 font-light'

export function CheckoutForm({ onError }: CheckoutFormProps) {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
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
      address: '',
      notes: '',
      acceptTerms: true,
    },
  })

  async function onSubmit(data: CustomerFormData) {
    if (items.length === 0) {
      setSubmitError('El carrito se encuentra vacío.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Dispatch order initialization to our backend
      // Backend signs with WOMPI_INTEGRITY_SECRET and returns official hosted checkout URL
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
          },
          items,
          subtotal: getTotalPrice(),
          shipping: 0,
          total: getTotalPrice(),
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
            Completa tus datos para ser redirigido a la pasarela de pagos oficial de Bancolombia / Wompi.
          </p>
        </div>

        {submitError && (
          <div className="mt-6 border border-red-500/40 bg-red-950/30 p-4">
            <p className="font-body text-xs text-red-300">
              <strong>Atención:</strong> {submitError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
                className={INPUT_CLASS + ' cursor-pointer bg-[#0A1B54]'}
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

          {/* City */}
          <div>
            <label className={LABEL_CLASS}>Ciudad o municipio de destino</label>
            <input
              {...register('city')}
              className={INPUT_CLASS}
              placeholder="Bogotá D.C., Medellín, Cali, Barranquilla, Bucaramanga..."
              autoComplete="address-level2"
              disabled={isSubmitting}
            />
            {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className={LABEL_CLASS}>Dirección exacta y especificaciones</label>
            <input
              {...register('address')}
              className={INPUT_CLASS}
              placeholder="Calle / Carrera, Número de inmueble, Apartamento o Casa"
              autoComplete="street-address"
              disabled={isSubmitting}
            />
            {errors.address && <p className={ERROR_CLASS}>{errors.address.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL_CLASS}>Notas de entrega para la fábrica (opcional)</label>
            <textarea
              {...register('notes')}
              className={INPUT_CLASS + ' resize-none'}
              rows={2}
              placeholder="Dimensiones de escaleras, ascensor de carga, horarios preferidos..."
              disabled={isSubmitting}
            />
          </div>

          {/* Shipping Policy Notice */}
          <div className="border border-[#C5A059]/40 bg-[#C5A059]/10 p-4">
            <p className="font-body text-xs text-[#C5A059] leading-relaxed">
              <strong>Política de Entrega Directa:</strong> Los envíos no están incluidos en el costo del colchón para no inflar los precios de fábrica. El flete se liquidará y coordinará directamente contigo vía WhatsApp o llamada tras confirmar la orden.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-1 h-4 w-4 rounded-none border border-white/30 bg-transparent text-[#C5A059] focus:ring-0 focus:ring-offset-0"
                disabled={isSubmitting}
              />
              <span className="font-body text-xs text-white/60 leading-relaxed select-none">
                Acepto los términos de compra directa de fábrica y entiendo que el flete de transporte se liquidará por separado antes del despacho del pedido.
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
              'Pagar Orden Segura con Wompi'
            )}
          </button>

          {/* Official Security Badges */}
          <SecurityBadges />
        </form>
      </motion.div>
    </div>
  )
}
