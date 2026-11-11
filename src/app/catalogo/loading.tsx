import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function CatalogoLoading() {
  return (
    <main className="bg-white min-h-screen text-[#0A1B54]">
      <Header />
      <div className="relative min-h-screen pt-28 pb-24 bg-white">
        {/* Skeleton Header */}
        <div className="border-b border-[#0A1B54]/10 px-6 pb-12 lg:px-16 animate-pulse">
          <div className="h-4 w-44 bg-[#C5A059]/30 rounded mb-4" />
          <div className="h-12 w-3/4 max-w-xl bg-[#0A1B54]/10 rounded mb-4" />
          <div className="h-4 w-full max-w-md bg-[#0A1B54]/10 rounded" />
        </div>

        {/* Skeleton Metric Bar */}
        <div className="border-b border-[#0A1B54]/10 px-6 py-3.5 lg:px-16 bg-[#FAF9F7] flex items-center justify-between animate-pulse">
          <div className="h-3 w-40 bg-[#0A1B54]/10 rounded" />
          <div className="h-3 w-64 bg-[#C5A059]/30 rounded" />
        </div>

        {/* Skeleton Spinner / Live Status */}
        <div className="flex flex-col items-center justify-center px-6 py-32 lg:px-16">
          <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-body text-xs uppercase tracking-widest text-[#0A1B54]/50">
            Sincronizando catálogo en tiempo real...
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
