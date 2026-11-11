import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CheckoutPageClient } from '@/components/checkout/CheckoutPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Seguro',
  description: 'Finaliza tu compra de manera segura con Wompi.',
}

export default function CheckoutPage() {
  return (
    <main className="bg-white min-h-screen text-[#0A1B54]">
      <Header />
      <CheckoutPageClient />
      <Footer />
    </main>
  )
}
