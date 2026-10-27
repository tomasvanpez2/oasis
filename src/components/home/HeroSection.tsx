'use client'
import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, type MotionValue } from 'framer-motion'
import Link from 'next/link'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

interface MattressLayer {
  id: string
  num: string
  name: string
  technicalSpec: string
  thickness: string
  color: string
  borderColor: string
  badge: string
  description: string
  explodedY: number
  assembledY: number
}

const MATTRESS_LAYERS: MattressLayer[] = [
  {
    id: 'layer-1',
    num: '01',
    name: 'Tejido Stretch Tencel & Algodón Orgánico',
    technicalSpec: 'Gramaje 420 g/m² — Hipoalergénico y Termorregulador',
    thickness: '3 cm',
    color: '#EFECE6',
    borderColor: '#C5A059',
    badge: 'Capa Térmica Superior',
    description: 'Acolchado capitoné en rombos continuos de seda vegetal que absorbe y disipa humedad pasiva.',
    explodedY: -160,
    assembledY: -36,
  },
  {
    id: 'layer-2',
    num: '02',
    name: 'Memory Foam Viscoelástica Celda Abierta',
    technicalSpec: 'Densidad 60 kg/m³ — Micro-ventilación Gravedad Cero',
    thickness: '4 cm',
    color: '#C5A059',
    borderColor: '#D4B576',
    badge: 'Confort Ergonómico',
    description: 'Espuma viscoelástica termo-sensible que mitiga el 94% de los puntos de presión en hombros y cadera.',
    explodedY: -80,
    assembledY: -18,
  },
  {
    id: 'layer-3',
    num: '03',
    name: 'Núcleo de Transición Anatómica HR-40',
    technicalSpec: 'Espuma Alta Resiliencia — 7 Zonas Biomecánicas',
    thickness: '5 cm',
    color: '#1A2E6B',
    borderColor: '#3A529B',
    badge: 'Distribución Dinámica',
    description: 'Canales longitudinales que aíslan el peso corporal y modulan la firmeza entre el torso y las extremidades.',
    explodedY: 0,
    assembledY: 0,
  },
  {
    id: 'layer-4',
    num: '04',
    name: 'Matriz de 800 Resortes Pocket Ensacados',
    technicalSpec: 'Acero al Carbono Templado Calibre 14.5 Independiente',
    thickness: '18 cm',
    color: '#0D2266',
    borderColor: '#C5A059',
    badge: 'Soporte Autónomo',
    description: 'Espirales autónomas en fundas de tela no tejida (TNT) con cero transmisión de vibración o movimiento de pareja.',
    explodedY: 90,
    assembledY: 20,
  },
  {
    id: 'layer-5',
    num: '05',
    name: 'Base Estabilizadora Ortopédica HD-45',
    technicalSpec: 'Fieltro Termofijado + Cimiento de Alta Densidad',
    thickness: '6 cm',
    color: '#07133B',
    borderColor: '#1A2E6B',
    badge: 'Sustentación Estructural',
    description: 'Base rígida certificada para 120,000 ciclos continuos de carga sin deformación dimensional.',
    explodedY: 170,
    assembledY: 40,
  },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeLayer, setActiveLayer] = useState<MattressLayer>(MATTRESS_LAYERS[1])
  const [manualAssembleMode, setManualAssembleMode] = useState<boolean | null>(null)

  // Scroll synchronization: the mattress assembles progressively as the user scrolls
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Smooth assembling factor: 0 (fully exploded) -> 1 (fully assembled)
  const scrollAssemblyFactor = useTransform(scrollYProgress, [0, 0.45], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[105vh] overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28"
    >
      {/* Precision 1px Architectural Column Grid Lines (5 asymmetric guide columns) */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-5 opacity-10">
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-white/20" />
        <div className="border-r border-transparent" />
      </div>

      {/* Atmospheric ambient lighting */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A2E6B]/30 blur-[140px]" />
      <div className="pointer-events-none absolute right-10 top-1/2 h-80 w-80 rounded-full bg-[#C5A059]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Asymmetric 5-Column to 7-Column Master Grid */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* ── COLUMNA IZQUIERDA: 5 COLUMNAS ASIMÉTRICAS EDITORIAL QUIET LUXURY ── */}
          <div className="flex flex-col justify-center lg:col-span-5">
            {/* Direct Factory Quality Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2.5 border border-[#C5A059]/40 bg-[#C5A059]/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                  Manufactura Directa — Bogotá, Colombia
                </span>
              </span>
            </motion.div>

            {/* Display Typography with Text-Splitting */}
            <div className="mt-6">
              <TextSplitReveal
                text="Ingeniería de Descanso."
                as="h1"
                className="font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-[0.93] tracking-tight text-white"
                delay={0.1}
                stagger={0.06}
              />
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 font-display italic text-2xl sm:text-3xl font-light text-[#C5A059]"
              >
                Sin intermediarios. Sin margen de retail.
              </motion.p>
            </div>

            {/* Subtitle / Architectural Thesis */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-body text-sm sm:text-[15px] text-white/70 max-w-lg leading-relaxed"
            >
              Construimos 13 referencias técnicas capa a capa en nuestro taller industrial.
              Fusionamos matrices de resortes pocket de acero templado, látex Dunlop natural
              y espumas viscoelásticas certificadas de alta densidad para máxima durabilidad biomecánica.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
            >
              <Link
                href="/catalogo"
                className="group flex items-center gap-3 border border-white bg-white px-7 py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-transparent hover:text-white"
              >
                Ver Catálogo (13 Modelos)
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/fabrica"
                className="border border-white/20 bg-white/5 px-6 py-4 font-body text-xs uppercase tracking-widest text-white/80 transition-all duration-300 hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                Conoce la Fábrica
              </Link>
            </motion.div>

            {/* Industrial Metrics: Strict 1px gold/white borders */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.85 }}
              className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8"
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-normal text-white">20+</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/50">
                  Años manufactura
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-[#C5A059]">13</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/50">
                  Referencias técnicas
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="font-display text-2xl sm:text-3xl font-normal text-white">0%</p>
                <p className="mt-1 font-body text-2xs uppercase tracking-wider text-white/50">
                  Sobreprecio retail
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── COLUMNA DERECHA: 7 COLUMNAS — DIAGRAMA TÉCNICO ISOMÉTRICO 3D ── */}
          <div className="flex flex-col items-center lg:col-span-7">
            
            {/* Technical Diagram Header Control Bar */}
            <div className="mb-4 flex w-full max-w-xl items-center justify-between border border-white/10 bg-[#0D2266]/40 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="font-body text-2xs uppercase tracking-[0.2em] text-white/90">
                  Diagrama Técnico Isométrico 3D
                </span>
              </div>

              {/* State Mode Controls & Scroll Hint */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManualAssembleMode(false)}
                  className={`px-3 py-1 font-body text-2xs uppercase tracking-wider transition-colors ${
                    manualAssembleMode === false
                      ? 'border border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                      : 'border border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Separadas
                </button>
                <button
                  type="button"
                  onClick={() => setManualAssembleMode(true)}
                  className={`px-3 py-1 font-body text-2xs uppercase tracking-wider transition-colors ${
                    manualAssembleMode === true
                      ? 'border border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059]'
                      : 'border border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  Ensamblado
                </button>
                {manualAssembleMode !== null && (
                  <button
                    type="button"
                    onClick={() => setManualAssembleMode(null)}
                    title="Reanudar ensamble automático con scroll"
                    className="ml-1 text-[10px] text-white/40 hover:text-[#C5A059] underline underline-offset-2"
                  >
                    Auto-Scroll
                  </button>
                )}
              </div>
            </div>

            {/* Scroll Interaction Indicator Sub-pill */}
            <div className="mb-2 flex w-full max-w-xl items-center justify-between px-1">
              <span className="font-mono text-[10px] text-white/40">
                {manualAssembleMode !== null
                  ? 'Modo: Control Manual Fijado'
                  : '↓ Haz scroll para ensamblar las capas'}
              </span>
              <span className="font-mono text-[10px] text-[#C5A059]">
                5 Capas Biomecánicas
              </span>
            </div>

            {/* 3D Isometric Viewport Canvas */}
            <div className="relative flex h-[500px] sm:h-[540px] w-full max-w-xl items-center justify-center border border-white/10 bg-gradient-to-b from-[#0D2266]/30 via-[#0A1B54] to-[#07133B] p-4 overflow-hidden">
              
              {/* Technical Precision Coordinate Grid in Canvas */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(197,160,89,0.6) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* 3D Projection Perspective Space */}
              <div
                className="relative w-full max-w-md"
                style={{
                  perspective: '1400px',
                }}
              >
                <div
                  style={{
                    transform: 'rotateX(56deg) rotateZ(-26deg)',
                    transformStyle: 'preserve-3d',
                  }}
                  className="relative mx-auto h-[260px] w-[300px] sm:w-[350px] transition-transform duration-700"
                >
                  {MATTRESS_LAYERS.map((layer) => {
                    const isSelected = activeLayer.id === layer.id

                    return (
                      <IsometricLayerItem
                        key={layer.id}
                        layer={layer}
                        isSelected={isSelected}
                        manualAssembleMode={manualAssembleMode}
                        scrollAssemblyFactor={scrollAssemblyFactor}
                        onSelect={() => setActiveLayer(layer)}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Geometric Floor Shadow */}
              <div
                className="absolute bottom-6 h-12 w-72 rounded-full bg-black/60 blur-xl pointer-events-none"
                style={{ transform: 'rotateX(60deg)' }}
              />
            </div>

            {/* Selected Layer Specification HUD */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-4 w-full max-w-xl border border-white/10 bg-[#0D2266]/40 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="border border-[#C5A059] bg-[#C5A059]/15 px-2 py-0.5 font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                      Capa {activeLayer.num}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-normal text-white">
                      {activeLayer.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-[#C5A059]">
                    {activeLayer.thickness}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/70">
                  <p className="font-body text-xs leading-relaxed">
                    {activeLayer.description}
                  </p>
                  <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40 mb-1">
                      Especificación Técnica:
                    </span>
                    <span className="font-body text-xs text-[#C5A059] font-medium">
                      ✓ {activeLayer.technicalSpec}
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

/**
 * Individual 3D Isometric Layer with reactive scroll-driven Y position
 */
function IsometricLayerItem({
  layer,
  isSelected,
  manualAssembleMode,
  scrollAssemblyFactor,
  onSelect,
}: {
  layer: MattressLayer
  isSelected: boolean
  manualAssembleMode: boolean | null
  scrollAssemblyFactor: MotionValue<number>
  onSelect: () => void
}) {
  // Compute reactive Y position using framer-motion useTransform
  const scrollY = useTransform(
    scrollAssemblyFactor,
    [0, 1],
    [layer.explodedY, layer.assembledY]
  )

  // Target Y based on manual override vs reactive scroll
  const currentY =
    manualAssembleMode === null
      ? scrollY
      : manualAssembleMode
      ? layer.assembledY
      : layer.explodedY

  return (
    <motion.div
      style={{
        y: currentY,
        scale: isSelected ? 1.03 : 1,
        height: '60px',
        transformStyle: 'preserve-3d',
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
      }}
      onClick={onSelect}
      className="group absolute inset-x-0 cursor-pointer"
    >
      {/* Top Isometric Face */}
      <div
        className={`relative h-full w-full border transition-all duration-300 ${
          isSelected
            ? 'border-[#C5A059] ring-1 ring-[#C5A059]'
            : 'border-white/20 hover:border-white/50'
        }`}
        style={{
          backgroundColor: layer.color,
          opacity: isSelected ? 0.95 : 0.82,
        }}
      >
        {/* Layer-specific technical vector texture */}
        {layer.id === 'layer-1' && (
          <svg className="absolute inset-0 h-full w-full opacity-35" fill="none">
            <pattern id="quiltPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0L20 10L10 20L0 10Z" stroke="#0A1B54" strokeWidth="0.8" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#quiltPattern)" />
          </svg>
        )}

        {layer.id === 'layer-2' && (
          <svg className="absolute inset-0 h-full w-full opacity-25" fill="none">
            <pattern id="memoryPores" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="6" cy="6" r="1.5" fill="#0A1B54" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#memoryPores)" />
          </svg>
        )}

        {layer.id === 'layer-4' && (
          <svg className="absolute inset-0 h-full w-full opacity-40" fill="none">
            <pattern id="springCoils" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="11" cy="11" r="8" stroke="#FDDA24" strokeWidth="1.2" />
              <circle cx="11" cy="11" r="4" stroke="#FDDA24" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#springCoils)" />
          </svg>
        )}

        {/* 3D simulated depth edge */}
        <div
          className="absolute -bottom-2.5 left-0 right-0 h-2.5 bg-black/45 border-b border-l border-r border-black/70"
          style={{ transform: 'skewX(45deg)' }}
        />

        {/* Technical Thickness Tag */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 bg-[#0A1B54]/95 px-2 py-0.5 border border-white/20">
          <span className="font-mono text-[9px] uppercase tracking-wider text-white">
            {layer.thickness}
          </span>
        </div>
      </div>

      {/* Floating Pointer & Leader Line Indicator */}
      <div
        className={`absolute -right-3 top-1/2 flex items-center transition-opacity duration-300 ${
          isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-85'
        }`}
        style={{
          transform: 'translateX(100%) translateY(-50%)',
        }}
      >
        <div className="h-px w-7 bg-[#C5A059]" />
        <div className="flex flex-col whitespace-nowrap pl-2">
          <span className="font-mono text-[10px] font-semibold text-[#C5A059] uppercase tracking-wider">
            {layer.badge}
          </span>
          <span className="font-body text-xs text-white">
            {layer.name.split(' ')[0]} {layer.name.split(' ')[1]}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
