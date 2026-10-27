'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

const GALLERY_ITEMS = [
  {
    src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80',
    alt: 'Área de corte de espuma',
    label: 'Corte Robótico de Espumas HR',
    clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
    col: 'md:col-span-2',
    aspectRatio: '16/9',
  },
  {
    src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    alt: 'Ensamblaje manual de capas',
    label: 'Ensamblado Artesanal',
    clipPath: 'polygon(0% 0%, 95% 0%, 100% 100%, 5% 100%)',
    col: 'md:col-span-1',
    aspectRatio: '3/4',
  },
  {
    src: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&q=80',
    alt: 'Control de calidad final',
    label: 'Control Biomecánico',
    clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)',
    col: 'md:col-span-1',
    aspectRatio: '3/4',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    alt: 'Almacén de materias primas',
    label: 'Acero Templado & Látex Dunlop',
    clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)',
    col: 'md:col-span-2',
    aspectRatio: '16/7',
  },
]

export function FabricaGallery() {
  return (
    <section className="border-t border-white/10 px-6 py-20 lg:px-16">
      <div className="mb-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
        >
          Transparencia Total
        </motion.p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-normal text-white">
          Dentro de la Planta de Producción
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GALLERY_ITEMS.map((item, i) => (
          <motion.figure
            key={item.label}
            className={`relative film-grain overflow-hidden border border-white/10 ${item.col}`}
            style={{ minHeight: '260px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover opacity-70 transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <figcaption className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#0A1B54]/80 px-4 py-3 backdrop-blur-sm flex items-center justify-between">
              <p className="font-body text-2xs uppercase tracking-wider text-white">
                {item.label}
              </p>
              <span className="font-mono text-[10px] text-[#C5A059]">
                Planta Bogotá
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
