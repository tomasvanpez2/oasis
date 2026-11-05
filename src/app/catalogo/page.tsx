import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CatalogClient } from '@/components/catalog/CatalogClient'
import { getCatalog } from '@/lib/blob'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo de Colchones',
  description:
    '13 referencias técnicas de colchones. Fabricación directa en Bogotá, Colombia. Sin intermediarios comerciales ni sobrecostos de retail.',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function CatalogoPage() {
  const catalog = await getCatalog()
  const initialProducts = catalog?.products || []

  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <CatalogClient initialProducts={initialProducts} />
      <Footer />
    </main>
  )
}
