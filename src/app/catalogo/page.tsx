import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CatalogClient } from '@/components/catalog/CatalogClient'
import { getCatalog } from '@/lib/blob'
import type { Metadata } from 'next'

// Directivas obligatorias Zero-Trust Caching: Evaden Edge Cache y Full Route Cache de Vercel/Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Catálogo de Colchones',
  description:
    'Catálogo de colchones y descanso. Fabricación directa en Bogotá, Colombia. Sin intermediarios comerciales ni sobrecostos de retail.',
}

async function CatalogFeed() {
  const catalog = await getCatalog()
  const initialProducts = catalog?.products || []
  return <CatalogClient initialProducts={initialProducts} />
}

function CatalogFeedSkeleton() {
  return (
    <div className="relative min-h-screen pt-28 pb-24 bg-[#0A1B54]">
      <div className="border-b border-white/10 px-6 pb-12 lg:px-16 animate-pulse">
        <div className="h-4 w-44 bg-[#C5A059]/30 rounded mb-4" />
        <div className="h-12 w-3/4 max-w-xl bg-white/10 rounded mb-4" />
        <div className="h-4 w-full max-w-md bg-white/10 rounded" />
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-32 lg:px-16">
        <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-body text-xs uppercase tracking-widest text-white/50">
          Sincronizando catálogo en tiempo real...
        </p>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <Suspense fallback={<CatalogFeedSkeleton />}>
        <CatalogFeed />
      </Suspense>
      <Footer />
    </main>
  )
}
