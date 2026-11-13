export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SuccessReceiptWrapper } from './SuccessReceiptWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recibo Oficial de Compra | Oasis Colchones',
  description: 'Comprobante de transacción y orden de producción.',
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CheckoutSuccessPage({ searchParams }: PageProps) {
  const reference = typeof searchParams.reference === 'string' ? searchParams.reference : ''
  const transactionId =
    (typeof searchParams.id === 'string' ? searchParams.id : '') ||
    (typeof searchParams.transactionId === 'string' ? searchParams.transactionId : '')

  return (
    <main className="bg-[#0A1B54] min-h-screen text-white">
      <Header />
      <div className="pt-24 pb-20">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center font-body text-xs uppercase tracking-widest text-white/50">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                <span>Verificando transacción bancaria con Wompi...</span>
              </div>
            </div>
          }
        >
          <SuccessReceiptWrapper
            initialReference={reference}
            initialTransactionId={transactionId}
          />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
