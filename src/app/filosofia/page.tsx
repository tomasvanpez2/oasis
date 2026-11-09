import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FilosofiaHero } from '@/components/filosofia/FilosofiaHero'
import { FilosofiaManifesto } from '@/components/filosofia/FilosofiaManifesto'
import { FilosofiaMissionVision } from '@/components/filosofia/FilosofiaMissionVision'
import { FilosofiaGallery } from '@/components/filosofia/FilosofiaGallery'
import { FilosofiaValues } from '@/components/filosofia/FilosofiaValues'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiénes Somos | Oasis Colchones y Muebles',
  description:
    'Oasis Colchones y Muebles: trayectoria desde 1998 con raíces boyacenses. Conoce nuestra historia, misión, visión y nuestro compromiso de calidad transparente.',
}

export default function FilosofiaPage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <FilosofiaHero />
      <FilosofiaManifesto />
      <FilosofiaMissionVision />
      <FilosofiaGallery />
      <FilosofiaValues />
      <Footer />
    </main>
  )
}
