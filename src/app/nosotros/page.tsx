import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FilosofiaHero } from '@/components/filosofia/FilosofiaHero'
import { FilosofiaManifesto } from '@/components/filosofia/FilosofiaManifesto'
import { FilosofiaMissionVision } from '@/components/filosofia/FilosofiaMissionVision'
import { FilosofiaValues } from '@/components/filosofia/FilosofiaValues'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros | Oasis Colchones y Muebles',
  description:
    'Oasis Colchones y Muebles: trayectoria desde 1998, origen en Bogotá y raíces boyacenses. Poner a dormir bien a todos los colombianos.',
}

export default function NosotrosPage() {
  return (
    <main className="bg-white min-h-screen text-[#0A1B54]">
      <Header />
      <FilosofiaHero />
      <FilosofiaManifesto />
      <FilosofiaMissionVision />
      <FilosofiaValues />
      <Footer />
    </main>
  )
}

