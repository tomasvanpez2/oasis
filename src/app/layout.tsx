import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/ui/SmoothScrollProvider'
import { CartDrawer } from '@/components/ui/CartDrawer'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Oasis Colchones',
    default: 'Oasis Colchones — Ingeniería de Descanso',
  },
  description:
    'Fábrica directa de colchones en Colombia. 13 referencias de ingeniería de descanso. Sin intermediarios.',
  keywords: ['colchones', 'fábrica', 'Colombia', 'descanso', 'Oasis'],
  openGraph: {
    title: 'Oasis Colchones — Ingeniería de Descanso',
    description: 'Fábrica directa. Sin intermediarios. Calidad de manufactura.',
    locale: 'es_CO',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      <body>
        <SmoothScrollProvider>
          {children}
          <CartDrawer />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
