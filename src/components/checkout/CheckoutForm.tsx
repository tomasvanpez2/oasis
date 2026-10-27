'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { tokenizeCard } from '@/lib/wompi'
import { SecurityBadges } from './SecurityBadges'
import type { CheckoutStep } from './CheckoutPageClient'

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
  city: z.string().min(3, 'Indica la ciudad de destino en Colombia'),
  address: z.string().min(8, 'Dirección de entrega completa y nomenclatura'),
  notes: z.string().optional(),
})

const paymentSchema = z.object({
  paymentMethod: z.enum(['CARD', 'BANCOLOMBIA_TRANSFER']),
  cardNumber: z.string().refine((val) => {
    const raw = val.replace(/\s/g, '')
    return raw.length >= 15 && raw.length <= 16
  }, 'Número de tarjeta debe tener 15 o 16 dígitos'),
  cardHolder: z.string().min(3, 'Nombre del titular tal como aparece en la tarjeta'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mes de expiración MM (01-12)'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Año de expiración YY (ej. 28)'),
  cvv: z.string().min(3, 'CVV de 3 o 4 dígitos').max(4, 'Máximo 4 dígitos'),
  installments: z.number().int().min(1).max(36),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y el aviso de flete por separado' }),
  }),
})

type CustomerData = z.infer<typeof customerSchema>
type PaymentData = z.infer<typeof paymentSchema>

interface CheckoutFormProps {
  step: CheckoutStep
  onStepChange: (step: CheckoutStep) => void
  onSuccess: (reference: string) => void
  onError: () => void
}

const INPUT_CLASS =
  'w-full border border-white/20 bg-transparent px-4 py-3.5 font-body text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 focus:border-[#C5A059] focus:ring-0 disabled:opacity-50'

const LABEL_CLASS = 'block font-body text-2xs uppercase tracking-[0.18em] text-white/50 mb-2'
const ERROR_CLASS = 'mt-1.5 font-body text-xs text-red-400 font-light'

export function CheckoutForm({ step, onStepChange, onSuccess, onError }: CheckoutFormProps) {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'BANCOLOMBIA_TRANSFER'>('CARD')

  const customerForm = useForm<CustomerData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      documentType: 'CC',
      document: '',
      city: 'Bogotá, D.C.',
      address: '',
      notes: '',
    },
  })

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'CARD',
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '12',
      expiryYear: '28',
      cvv: '123',
      installments: 1,
      acceptTerms: true,
    },
  })

  // Quick fill helper for local dev / testing
  function handleFillTestData() {
    customerForm.setValue('fullName', 'Carlos Alberto Restrepo')
    customerForm.setValue('email', 'carlos.restrepo@oasis-test.co')
    customerForm.setValue('phone', '3104567890')
    customerForm.setValue('documentType', 'CC')
    customerForm.setValue('document', '1020304050')
    customerForm.setValue('city', 'Bogotá - Usaquén')
    customerForm.setValue('address', 'Carrera 15 # 119 - 42 Apto 402')
    customerForm.setValue('notes', 'Entregar en portería, edificio con ascensor grande.')
  }

  function handleFillTestCard() {
    paymentForm.setValue('cardNumber', '4242 4242 4242 4242')
    paymentForm.setValue('cardHolder', 'CARLOS A RESTREPO')
    paymentForm.setValue('expiryMonth', '12')
    paymentForm.setValue('expiryYear', '29')
    paymentForm.setValue('cvv', '888')
    paymentForm.setValue('installments', 1)
  }

  async function handleCustomerSubmit(data: CustomerData) {
    setCustomerData(data)
    setSubmitError(null)
    onStepChange('payment')
  }

  async function handlePaymentSubmit(data: PaymentData) {
    if (!customerData) {
      onStepChange('customer')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const rawNumber = data.cardNumber.replace(/\s/g, '')

      // 1. Client-side card tokenization via Wompi module
      const tokenResult = await tokenizeCard({
        number: rawNumber,
        cvc: data.cvv,
        exp_month: data.expiryMonth,
        exp_year: data.expiryYear,
        card_holder: data.cardHolder,
      })

      // 2. Dispatch native transaction to our Next.js API route
      const response = await fetch('/api/wompi-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wompi-dev-mode': 'true',
        },
        body: JSON.stringify({
          customer: customerData,
          items,
          subtotal: getTotalPrice(),
          shipping: 0,
          total: getTotalPrice(),
          cardToken: tokenResult.id,
          installments: data.installments,
          paymentMethodType: selectedMethod,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'La transacción no pudo ser autorizada.')
      }

      // Success
      clearCart()
      onSuccess(result.reference)
    } catch (err) {
      console.error('[checkout:error]', err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al procesar el pago. Por favor intenta nuevamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Step Breadcrumbs */}
      <div className="mb-10 flex items-center gap-4">
        {[
          { id: 'customer', label: '1. Datos de entrega' },
          { id: 'payment', label: '2. Pago Nativo Wompi' },
        ].map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center border font-body text-xs transition-colors duration-300 ${
                (step === 'customer' && idx === 0) || (step === 'payment' && idx === 1)
                  ? 'border-[#C5A059] text-[#C5A059]'
                  : idx === 0 && step === 'payment'
                  ? 'border-white/50 text-white/50'
                  : 'border-white/20 text-white/20'
              }`}
            >
              {idx + 1}
            </span>
            <span
              className={`font-body text-xs uppercase tracking-wider transition-colors duration-300 ${
                (step === 'customer' && idx === 0) || (step === 'payment' && idx === 1)
                  ? 'text-white'
                  : 'text-white/40'
              }`}
            >
              {s.label}
            </span>
            {idx < 1 && <div className="mx-2 h-px w-8 bg-white/15" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Customer Info ─────────────────────────────────────── */}
        {step === 'customer' && (
          <motion.div
            key="customer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
                  Paso 1 de 2
                </p>
                <h2 className="mt-1 font-display text-3xl font-normal text-white">
                  Datos de entrega
                </h2>
              </div>
              <button
                type="button"
                onClick={handleFillTestData}
                className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1.5 font-body text-2xs uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/20 transition-colors"
                title="Rellena el formulario con datos colombianos de prueba para entorno local"
              >
                + Cargar datos test
              </button>
            </div>

            <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="mt-8 space-y-5">
              {/* Full Name */}
              <div>
                <label className={LABEL_CLASS}>Nombre completo del titular</label>
                <input
                  {...customerForm.register('fullName')}
                  className={INPUT_CLASS}
                  placeholder="Ej. Juan Manuel Galán"
                  autoComplete="name"
                />
                {customerForm.formState.errors.fullName && (
                  <p className={ERROR_CLASS}>{customerForm.formState.errors.fullName.message}</p>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Correo electrónico</label>
                  <input
                    {...customerForm.register('email')}
                    type="email"
                    className={INPUT_CLASS}
                    placeholder="comprador@ejemplo.com"
                    autoComplete="email"
                  />
                  {customerForm.formState.errors.email && (
                    <p className={ERROR_CLASS}>{customerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Teléfono celular (Colombia)</label>
                  <input
                    {...customerForm.register('phone')}
                    type="tel"
                    className={INPUT_CLASS}
                    placeholder="300 123 4567"
                    autoComplete="tel"
                  />
                  {customerForm.formState.errors.phone && (
                    <p className={ERROR_CLASS}>{customerForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Document type + number */}
              <div className="grid grid-cols-[130px_1fr] gap-4">
                <div>
                  <label className={LABEL_CLASS}>Tipo doc.</label>
                  <select
                    {...customerForm.register('documentType')}
                    className={INPUT_CLASS + ' cursor-pointer bg-[#0A1B54]'}
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
                    {...customerForm.register('document')}
                    className={INPUT_CLASS}
                    placeholder="1020304050"
                  />
                  {customerForm.formState.errors.document && (
                    <p className={ERROR_CLASS}>{customerForm.formState.errors.document.message}</p>
                  )}
                </div>
              </div>

              {/* City */}
              <div>
                <label className={LABEL_CLASS}>Ciudad o municipio de destino</label>
                <input
                  {...customerForm.register('city')}
                  className={INPUT_CLASS}
                  placeholder="Bogotá D.C., Medellín, Cali, Barranquilla, Bucaramanga..."
                  autoComplete="address-level2"
                />
                {customerForm.formState.errors.city && (
                  <p className={ERROR_CLASS}>{customerForm.formState.errors.city.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className={LABEL_CLASS}>Dirección exacta y especificaciones</label>
                <input
                  {...customerForm.register('address')}
                  className={INPUT_CLASS}
                  placeholder="Calle / Carrera, Número de inmueble, Apartamento o Casa"
                  autoComplete="street-address"
                />
                {customerForm.formState.errors.address && (
                  <p className={ERROR_CLASS}>{customerForm.formState.errors.address.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={LABEL_CLASS}>Notas de entrega para la fábrica (opcional)</label>
                <textarea
                  {...customerForm.register('notes')}
                  className={INPUT_CLASS + ' resize-none'}
                  rows={2}
                  placeholder="Dimensiones de escaleras, ascensor de carga, horarios preferidos..."
                />
              </div>

              {/* Shipping Policy Notice */}
              <div className="border border-[#C5A059]/40 bg-[#C5A059]/10 p-4">
                <p className="font-body text-xs text-[#C5A059] leading-relaxed">
                  <strong>Política de Entrega Directa:</strong> Los envíos no están incluidos en el costo del colchón para no inflar los precios de fábrica. El flete se liquidará y coordinará directamente contigo vía WhatsApp / llamada tras confirmar la orden.
                </p>
              </div>

              <button
                type="submit"
                className="w-full border border-white py-4 font-body text-xs uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-[#0A1B54]"
              >
                Continuar al Pago Seguro
              </button>
            </form>
          </motion.div>
        )}

        {/* ── STEP 2: Native Payment ─────────────────────────────────────── */}
        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onStepChange('customer')}
                className="font-body text-xs text-white/50 transition-colors hover:text-white"
              >
                ← Volver a datos
              </button>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1.5 font-body text-2xs uppercase tracking-wider text-[#C5A059] hover:bg-[#C5A059]/20 transition-colors"
                title="Cargar tarjeta de prueba para entorno local"
              >
                + Cargar tarjeta test
              </button>
            </div>

            <div className="mt-4">
              <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
                Paso 2 de 2
              </p>
              <h2 className="mt-1 font-display text-3xl font-normal text-white">
                Web Checkout Nativo
              </h2>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`border p-4 text-left transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-[#C5A059] bg-[#C5A059]/10 text-white'
                    : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider">
                    Tarjeta Crédito / Débito
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
                </div>
                <p className="mt-1 font-body text-2xs text-white/50">
                  Visa, Mastercard, Amex, Débito Bancario
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('BANCOLOMBIA_TRANSFER')}
                className={`border p-4 text-left transition-all ${
                  selectedMethod === 'BANCOLOMBIA_TRANSFER'
                    ? 'border-[#FDDA24] bg-[#FDDA24]/10 text-white'
                    : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#FDDA24]">
                    Botón Bancolombia
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#FDDA24]" />
                </div>
                <p className="mt-1 font-body text-2xs text-white/50">
                  Transferencia directa App Bancolombia
                </p>
              </button>
            </div>

            {submitError && (
              <div className="mt-6 border border-red-500/40 bg-red-950/30 p-4">
                <p className="font-body text-xs text-red-300">
                  <strong>Atención:</strong> {submitError}
                </p>
              </div>
            )}

            <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="mt-6 space-y-5">
              {/* Card number */}
              <div>
                <label className={LABEL_CLASS}>Número de tarjeta</label>
                <input
                  {...paymentForm.register('cardNumber')}
                  className={INPUT_CLASS}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  autoComplete="cc-number"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').substring(0, 16)
                    const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
                    e.target.value = formatted
                    paymentForm.setValue('cardNumber', formatted)
                  }}
                />
                {paymentForm.formState.errors.cardNumber && (
                  <p className={ERROR_CLASS}>{paymentForm.formState.errors.cardNumber.message}</p>
                )}
              </div>

              {/* Card holder */}
              <div>
                <label className={LABEL_CLASS}>Nombre en la tarjeta</label>
                <input
                  {...paymentForm.register('cardHolder')}
                  className={INPUT_CLASS}
                  placeholder="CARLOS A RESTREPO"
                  autoComplete="cc-name"
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase()
                    e.target.value = val
                    paymentForm.setValue('cardHolder', val)
                  }}
                />
                {paymentForm.formState.errors.cardHolder && (
                  <p className={ERROR_CLASS}>{paymentForm.formState.errors.cardHolder.message}</p>
                )}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Mes (MM)</label>
                  <input
                    {...paymentForm.register('expiryMonth')}
                    className={INPUT_CLASS}
                    placeholder="12"
                    maxLength={2}
                    autoComplete="cc-exp-month"
                  />
                  {paymentForm.formState.errors.expiryMonth && (
                    <p className={ERROR_CLASS}>{paymentForm.formState.errors.expiryMonth.message}</p>
                  )}
                </div>

                <div>
                  <label className={LABEL_CLASS}>Año (YY)</label>
                  <input
                    {...paymentForm.register('expiryYear')}
                    className={INPUT_CLASS}
                    placeholder="28"
                    maxLength={2}
                    autoComplete="cc-exp-year"
                  />
                  {paymentForm.formState.errors.expiryYear && (
                    <p className={ERROR_CLASS}>{paymentForm.formState.errors.expiryYear.message}</p>
                  )}
                </div>

                <div>
                  <label className={LABEL_CLASS}>CVV / CVC</label>
                  <input
                    {...paymentForm.register('cvv')}
                    type="password"
                    className={INPUT_CLASS}
                    placeholder="123"
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                  {paymentForm.formState.errors.cvv && (
                    <p className={ERROR_CLASS}>{paymentForm.formState.errors.cvv.message}</p>
                  )}
                </div>
              </div>

              {/* Installments / Cuotas */}
              <div>
                <label className={LABEL_CLASS}>Número de cuotas</label>
                <select
                  {...paymentForm.register('installments', { valueAsNumber: true })}
                  className={INPUT_CLASS + ' cursor-pointer bg-[#0A1B54]'}
                >
                  <option value={1}>1 cuota (Sin intereses)</option>
                  <option value={2}>2 cuotas</option>
                  <option value={3}>3 cuotas</option>
                  <option value={6}>6 cuotas</option>
                  <option value={12}>12 cuotas</option>
                  <option value={24}>24 cuotas</option>
                  <option value={36}>36 cuotas</option>
                </select>
              </div>

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...paymentForm.register('acceptTerms')}
                    className="mt-1 h-4 w-4 rounded-none border border-white/30 bg-transparent text-[#C5A059] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="font-body text-xs text-white/60 leading-relaxed select-none">
                    Acepto los términos de compra directa de fábrica y entiendo que el flete de transporte se liquidará por separado antes del despacho del pedido.
                  </span>
                </label>
                {paymentForm.formState.errors.acceptTerms && (
                  <p className={ERROR_CLASS}>{paymentForm.formState.errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-[#C5A059] bg-[#C5A059] py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-white hover:border-white hover:text-[#0A1B54] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-[#0A1B54] border-t-transparent rounded-full animate-spin" />
                    Procesando con Wompi...
                  </span>
                ) : (
                  'Pagar Orden Segura con Wompi'
                )}
              </button>

              {/* Security logos & explanations */}
              <SecurityBadges />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
