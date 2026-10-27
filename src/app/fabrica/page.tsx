import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FabricaHero } from '@/components/fabrica/FabricaHero'
import { FabricaManifesto } from '@/components/fabrica/FabricaManifesto'
import { FabricaGallery } from '@/components/fabrica/FabricaGallery'
import { FabricaValues } from '@/components/fabrica/FabricaValues'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuestra Fábrica',
  description:
    'Transparencia total. Conoce el proceso de manufactura directa de Oasis Colchones en Bogotá, Colombia.',
}

export default function FabricaPage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <FabricaHero />
      <FabricaManifesto />
      <FabricaGallery />
      <FabricaValues />
      <Footer />
    </main>
  )
}
