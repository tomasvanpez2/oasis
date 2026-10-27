import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CatalogClient } from '@/components/catalog/CatalogClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo',
  description: '13 referencias técnicas de colchones. Fabricación directa en Colombia. Sin intermediarios.',
}

export default function CatalogoPage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <CatalogClient />
      <Footer />
    </main>
  )
}
