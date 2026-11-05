import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FilosofiaHero } from '@/components/filosofia/FilosofiaHero'
import { FilosofiaMissionVision } from '@/components/filosofia/FilosofiaMissionVision'
import { FilosofiaManifesto } from '@/components/filosofia/FilosofiaManifesto'
import { FilosofiaGallery } from '@/components/filosofia/FilosofiaGallery'
import { FilosofiaValues } from '@/components/filosofia/FilosofiaValues'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Filosofía de Manufactura',
  description:
    'Misión, Visión, Valores industriales y confección directa de colchones biomecánicos en Bogotá. Sin intermediación comercial ni margen de retail.',
}

export default function FilosofiaPage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <FilosofiaHero />
      <FilosofiaMissionVision />
      <FilosofiaManifesto />
      <FilosofiaGallery />
      <FilosofiaValues />
      <Footer />
    </main>
  )
}
