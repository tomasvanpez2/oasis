'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface LayerData {
  id: string
  name: string
  spec: string
  thickness: string
  color: string
  strokeColor: string
  badge: string
  description: string
  elevation: number
}

const MATTRESS_LAYERS: LayerData[] = [
  {
    id: 'layer-1',
    name: 'Tejido Stretch Tencel & Algodón Orgánico',
    spec: 'Gramaje 420 g/m² — Hipoalergénico',
    thickness: '3 cm',
    color: '#E8E2D5',
    strokeColor: '#C5A059',
    badge: 'Capa Térmica 01',
    description: 'Acolchado capitoné en rombos continuos con hilo de seda vegetal termorreguladora.',
    elevation: -140,
  },
  {
    id: 'layer-2',
    name: 'Memory Foam Viscoelástica Celda Abierta',
    spec: 'Densidad 60 kg/m³ — Efecto Gravedad Cero',
    thickness: '4 cm',
    color: '#C5A059',
    strokeColor: '#D4B576',
    badge: 'Confort Ergonómico 02',
    description: 'Espuma de memoria que disipa el 94% de los puntos de presión en hombros y cadera.',
    elevation: -70,
  },
  {
    id: 'layer-3',
    name: 'Núcleo de Transición Anatómica HR-40',
    spec: 'Alta Resiliencia — 7 Zonas de Presión',
    thickness: '5 cm',
    color: '#1A2E6B',
    strokeColor: '#3A529B',
    badge: 'Distribución 03',
    description: 'Canales transversales de ventilación que evitan la acumulación de calor corporal.',
    elevation: 0,
  },
  {
    id: 'layer-4',
    name: 'Matriz de 800 Resortes Pocket Ensacados',
    spec: 'Acero al Carbono Templado Cal. 14.5',
    thickness: '18 cm',
    color: '#0D2266',
    strokeColor: '#C5A059',
    badge: 'Soporte Autónomo 04',
    description: 'Espirales independientes encapsuladas en bolsas TNT individuales con cero transferencia de movimiento.',
    elevation: 80,
  },
  {
    id: 'layer-5',
    name: 'Base Estabilizadora Ortopédica HD-45',
    spec: 'Fieltro Termofijado + Soporte Rígido',
    thickness: '6 cm',
    color: '#07133B',
    strokeColor: '#1A2E6B',
    badge: 'Sustentación 05',
    description: 'Cimiento indeformable certificado para 15 años de resistencia bajo cargas dinámicas continuas.',
    elevation: 160,
  },
]

export function HeroSection() {
  const [isExploded, setIsExploded] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerData>(MATTRESS_LAYERS[1])

  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      {/* Background Architectural Grid Lines */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-1 md:grid-cols-5 opacity-10">
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ── LEFT COLUMN: Editorial Quiet Luxury Copy (5 cols) ────────── */}
          <div className="flex flex-col justify-center lg:col-span-5">
            {/* Tag line */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2.5 border border-[#C5A059]/50 bg-[#C5A059]/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]">
                  Fábrica Directa — Bogotá, Colombia
                </span>
              </span>
            </motion.div>

            {/* Main Title: Generous fluid clamp, no tight overflow-hidden truncation */}
            <div className="mt-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[0.95] tracking-tight text-white"
              >
                Ingeniería de Descanso.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="mt-3 font-display italic text-2xl sm:text-3xl font-light text-[#C5A059]/90"
              >
                Sin intermediarios. Sin retail.
              </motion.p>
            </div>

            {/* Subtitle / Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-body text-sm text-white/70 max-w-lg leading-relaxed"
            >
              Diseñamos y ensamblamos 13 referencias técnicas capa por capa en nuestro propio taller industrial. Fusionamos resortes pocket de acero templado, látex Dunlop natural y espumas viscoelásticas certificadas de alta densidad.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
            >
              <Link
                href="/catalogo"
                className="group flex items-center gap-3 border border-white bg-white px-7 py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-transparent hover:text-white"
              >
                Explorar 13 Referencias
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/fabrica"
                className="border border-white/20 px-6 py-4 font-body text-xs uppercase tracking-widest text-white/70 transition-colors hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                Conoce la Fábrica
              </Link>
            </motion.div>

            {/* Industrial Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8"
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-normal text-white">20+</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/40">
                  Años manufactura
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#C5A059]">13</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/40">
                  Modelos técnicos
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-white">0%</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/40">
                  Margen retail
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Technical 3D Exploded Mattress Anatomy (7 cols) ─ */}
          <div className="flex flex-col items-center lg:col-span-7">
            {/* Exploded View Control Bar */}
            <div className="mb-6 flex w-full max-w-xl items-center justify-between border border-white/10 bg-[#0D2266]/40 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
                <span className="font-body text-2xs uppercase tracking-[0.2em] text-white/80">
                  Diagrama Anatómico Isométrico
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExploded(true)}
                  className={`px-3 py-1 font-body text-2xs uppercase tracking-wider transition-colors ${
                    isExploded
                      ? 'border border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  Vista Explotada
                </button>
                <button
                  type="button"
                  onClick={() => setIsExploded(false)}
                  className={`px-3 py-1 font-body text-2xs uppercase tracking-wider transition-colors ${
                    !isExploded
                      ? 'border border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  Ensamblado
                </button>
              </div>
            </div>

            {/* Isometric 3D Exploded Graphic Viewport */}
            <div className="relative flex h-[480px] sm:h-[520px] w-full max-w-xl items-center justify-center border border-white/10 bg-gradient-to-b from-[#0D2266]/30 to-[#0A1B54] p-4 overflow-hidden">
              {/* Technical Grid background inside canvas */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(197,160,89,0.5) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* 3D Perspective Canvas */}
              <div
                className="relative w-full max-w-md"
                style={{
                  perspective: '1200px',
                }}
              >
                <div
                  style={{
                    transform: 'rotateX(58deg) rotateZ(-28deg)',
                    transformStyle: 'preserve-3d',
                  }}
                  className="relative mx-auto h-[260px] w-[300px] sm:w-[340px] transition-transform duration-700"
                >
                  {MATTRESS_LAYERS.map((layer, index) => {
                    const isSelected = activeLayer.id === layer.id
                    // Calculate Y offset based on exploded or assembled state
                    const targetY = isExploded ? layer.elevation * 1.3 : (index - 2) * 22

                    return (
                      <motion.div
                        key={layer.id}
                        animate={{
                          y: targetY,
                          scale: isSelected ? 1.04 : 1,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 140,
                          damping: 18,
                        }}
                        onClick={() => setActiveLayer(layer)}
                        className="group absolute inset-x-0 cursor-pointer"
                        style={{
                          height: '60px',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* Top Isometric Face */}
                        <div
                          className={`relative h-full w-full border transition-all duration-300 ${
                            isSelected
                              ? 'border-[#C5A059] shadow-none ring-1 ring-[#C5A059]'
                              : 'border-white/20 hover:border-white/50'
                          }`}
                          style={{
                            backgroundColor: layer.color,
                            opacity: isSelected ? 0.95 : 0.82,
                          }}
                        >
                          {/* Inner Graphic Details depending on layer type */}
                          {layer.id === 'layer-1' && (
                            /* Quilted Diamond Pattern for Tencel Cover */
                            <svg className="absolute inset-0 h-full w-full opacity-30" fill="none">
                              <pattern id="quilt" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M10 0L20 10L10 20L0 10Z" stroke="#0A1B54" strokeWidth="0.8" fill="none" />
                              </pattern>
                              <rect width="100%" height="100%" fill="url(#quilt)" />
                            </svg>
                          )}

                          {layer.id === 'layer-2' && (
                            /* Memory Foam Micro-aeration grid */
                            <svg className="absolute inset-0 h-full w-full opacity-25" fill="none">
                              <pattern id="pores" width="12" height="12" patternUnits="userSpaceOnUse">
                                <circle cx="6" cy="6" r="1.5" fill="#0A1B54" />
                              </pattern>
                              <rect width="100%" height="100%" fill="url(#pores)" />
                            </svg>
                          )}

                          {layer.id === 'layer-4' && (
                            /* Pocket Spring Coils Matrix */
                            <svg className="absolute inset-0 h-full w-full opacity-40" fill="none">
                              <pattern id="coils" width="22" height="22" patternUnits="userSpaceOnUse">
                                <circle cx="11" cy="11" r="8" stroke="#FDDA24" strokeWidth="1.2" />
                                <circle cx="11" cy="11" r="4" stroke="#FDDA24" strokeWidth="0.8" />
                              </pattern>
                              <rect width="100%" height="100%" fill="url(#coils)" />
                            </svg>
                          )}

                          {/* Lateral 3D edge depth simulated */}
                          <div
                            className="absolute -bottom-2 left-0 right-0 h-2 bg-black/40 border-b border-l border-r border-black/60"
                            style={{ transform: 'skewX(45deg)' }}
                          />

                          {/* Technical layer indicator tag */}
                          <div className="absolute right-2 top-2 flex items-center gap-1.5 bg-[#0A1B54]/90 px-2 py-0.5 border border-white/20">
                            <span className="font-body text-[9px] uppercase tracking-wider text-white">
                              {layer.thickness}
                            </span>
                          </div>
                        </div>

                        {/* Interactive floating leader line & pointer */}
                        {isExploded && (
                          <div
                            className={`absolute -right-2 top-1/2 flex items-center transition-opacity duration-300 ${
                              isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                            }`}
                            style={{
                              transform: 'translateX(100%) translateY(-50%)',
                            }}
                          >
                            <div className="h-px w-8 bg-[#C5A059]" />
                            <div className="flex flex-col whitespace-nowrap pl-2">
                              <span className="font-body text-[10px] font-semibold text-[#C5A059] uppercase tracking-wider">
                                {layer.badge}
                              </span>
                              <span className="font-body text-xs text-white">
                                {layer.name.split(' ')[0]} {layer.name.split(' ')[1]}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Floor Elevation Shadow */}
              <div
                className="absolute bottom-6 h-12 w-64 rounded-full bg-black/50 blur-xl pointer-events-none"
                style={{ transform: 'rotateX(60deg)' }}
              />
            </div>

            {/* Active Selected Layer Technical Spec Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 w-full max-w-xl border border-white/10 bg-[#0D2266]/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="border border-[#C5A059] px-2 py-0.5 font-body text-2xs uppercase tracking-wider text-[#C5A059]">
                      {activeLayer.badge}
                    </span>
                    <h3 className="font-display text-lg font-normal text-white">
                      {activeLayer.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-white/50">
                    Espesor: {activeLayer.thickness}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/70">
                  <p className="font-body text-xs leading-relaxed">
                    {activeLayer.description}
                  </p>
                  <div className="flex items-center sm:justify-end border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                    <span className="font-body text-xs text-[#C5A059]">
                      ✓ {activeLayer.spec}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
