'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function FabricaHero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Full-bleed image with clip-path reveal */}
      <motion.div
        initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
        animate={{ clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)' }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="film-grain absolute inset-0"
      >
        <Image
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=85"
          alt="Interior fábrica Oasis Colchones"
          fill
          className="object-cover opacity-35"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B54] via-[#0A1B54]/80 to-[#0A1B54]/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[90vh] flex-col justify-end px-6 pb-16 pt-32 lg:px-16">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
          >
            Bogotá, Colombia — Desde 2004
          </motion.p>

          <div className="mt-3">
            <motion.h1
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Nuestra Fábrica.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-6 font-body text-sm sm:text-base text-white/70 max-w-xl leading-relaxed"
          >
            Aquí no escondemos nada. Esta es la infraestructura industrial real donde se manufactura
            cada uno de nuestros 13 colchones. Sin marketing ficticio ni intermediarios. Solo acero, látex y confección directa.
          </motion.p>
        </div>

        {/* Bottom metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8"
        >
          {[
            { value: '2,400 m²', label: 'Área de producción' },
            { value: '38', label: 'Operarios directos' },
            { value: '180', label: 'Colchones/mes' },
            { value: '20+', label: 'Años en operación' },
          ].map(({ value, label }) => (
            <div key={label} className="border-r border-white/10 pr-4 last:border-r-0">
              <p className="font-display text-2xl sm:text-3xl font-normal text-white">{value}</p>
              <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/40">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
