import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { ScrollStory } from '@/components/home/ScrollStory'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Manifesto } from '@/components/home/Manifesto'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ingeniería de Descanso',
  description:
    'Oasis Colchones. Fábrica directa en Colombia. 13 referencias de ingeniería aplicada al descanso humano.',
}

export default function HomePage() {
  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />
      <HeroSection />
      <ScrollStory />
      <FeaturedProducts />
      <Manifesto />
      <Footer />
    </main>
  )
}
