'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'

export interface TechnicalLayer {
  id: string
  num: string
  name: string
  shortName: string
  category: string
  thickness: string
  thicknessPx: number
  explodedZ: number
  assembledZ: number
  technicalSpec: string
  badge: string
  description: string
  composition: string[]
  topBg: string
  topBorder: string
  frontBg: string
  leftBg: string
  svgPatternId: string
  elbowY: number
}

export const TECHNICAL_LAYERS: TechnicalLayer[] = [
  {
    id: 'layer-1',
    num: '01',
    name: 'Tejido Stretch Tencel & Algodón Orgánico',
    shortName: 'Tejido Tencel 3cm',
    category: 'Superficie Térmica y Transpirable',
    thickness: '3 cm',
    thicknessPx: 18,
    explodedZ: 135,
    assembledZ: 0,
    technicalSpec: 'Gramaje 420 g/m² — Hipoalergénico y Termorregulador',
    badge: 'Capa Térmica Superior',
    description:
      'Acolchado capitoné en rombos continuos de seda vegetal Tencel con tratamiento antiácaros. Absorbe y disipa la humedad corporal un 50% más rápido que el algodón convencional, manteniendo la temperatura de descanso equilibrada.',
    composition: ['Fibra Tencel Lyocell', 'Algodón Orgánico Certificado', 'Tratamiento Sanitized® Antiácaros'],
    topBg: 'linear-gradient(135deg, #FBF9F5 0%, #ECE7DD 50%, #DDD6C8 100%)',
    topBorder: '#C5A059',
    frontBg: 'linear-gradient(180deg, #E6E0D3 0%, #C8C0AF 100%)',
    leftBg: 'linear-gradient(180deg, #D6CFC0 0%, #B4AB98 100%)',
    svgPatternId: 'tech-tencelQuilt',
    elbowY: -28,
  },
  {
    id: 'layer-2',
    num: '02',
    name: 'Memory Foam Viscoelástica Celda Abierta',
    shortName: 'Memory Foam 4cm',
    category: 'Alivio Ergonómico de Presión',
    thickness: '4 cm',
    thicknessPx: 24,
    explodedZ: 68,
    assembledZ: -18,
    technicalSpec: 'Densidad 60 kg/m³ — Micro-ventilación Gravedad Cero',
    badge: 'Confort Ergonómico',
    description:
      'Espuma viscoelástica termo-sensible de respuesta gradual. Se adapta al contorno anatómico mitigando el 94% de los puntos de presión en hombros y cadera, permitiendo una correcta descompresión vertebral.',
    composition: ['Viscoelástica 60 kg/m³', 'Estructura Celular Abierta', 'Partículas Cooling Gel'],
    topBg: 'linear-gradient(135deg, #DFB45E 0%, #C5A059 45%, #9E7A32 100%)',
    topBorder: '#E5C378',
    frontBg: 'linear-gradient(180deg, #B88E3E 0%, #7A5B20 100%)',
    leftBg: 'linear-gradient(180deg, #9C752E 0%, #5E4313 100%)',
    svgPatternId: 'tech-memoryFoamPores',
    elbowY: -14,
  },
  {
    id: 'layer-3',
    num: '03',
    name: 'Núcleo de Transición Anatómica HR-40',
    shortName: 'Núcleo HR-40 5cm',
    category: 'Distribución Dinámica de Cargas',
    thickness: '5 cm',
    thicknessPx: 28,
    explodedZ: 0,
    assembledZ: -42,
    technicalSpec: 'Espuma Alta Resiliencia — 7 Zonas Biomecánicas',
    badge: 'Distribución Dinámica',
    description:
      'Canales longitudinales de perfilado ergonómico que aíslan el peso corporal y modulan la firmeza entre el torso y las extremidades. Evita la sensación de hundimiento y asegura una postura fisiológica neutral.',
    composition: ['Espuma HR-40 Resiliente', 'Corte Perfilado 7 Zonas', 'Termofusión sin Solventes'],
    topBg: 'linear-gradient(135deg, #1C357E 0%, #132456 50%, #0E1A3D 100%)',
    topBorder: '#3A529B',
    frontBg: 'repeating-linear-gradient(90deg, #132456 0 18px, #0B1634 18px 22px)',
    leftBg: 'linear-gradient(180deg, #0F1C44 0%, #070E22 100%)',
    svgPatternId: 'tech-hr40Channels',
    elbowY: 0,
  },
  {
    id: 'layer-4',
    num: '04',
    name: 'Matriz de 800 Resortes Pocket Ensacados',
    shortName: 'Resortes Pocket 18cm',
    category: 'Independencia de Lechos y Rebote Autónomo',
    thickness: '18 cm',
    thicknessPx: 56,
    explodedZ: -75,
    assembledZ: -70,
    technicalSpec: 'Acero al Carbono Calibre 14.5 — Ensacado Autónomo en TNT',
    badge: 'Soporte Autónomo',
    description:
      'Espirales autónomas de acero templado al carbono ensacadas en fundas individuales de tela no tejida. Cada resorte responde exclusivamente a la presión local, logrando cero transmisión de vibración o movimiento de pareja.',
    composition: ['800 Resortes Ensacados (Queen)', 'Acero Calibre 14.5 Templado', 'Funda TNT Micro-perforada'],
    topBg: '#07133B',
    topBorder: '#C5A059',
    frontBg:
      'repeating-linear-gradient(90deg, #07133B 0px, #0F225A 8px, #C5A059 13px, #0F225A 18px, #07133B 26px)',
    leftBg:
      'repeating-linear-gradient(90deg, #040C24 0px, #091740 8px, #9E7C38 13px, #091740 18px, #040C24 26px)',
    svgPatternId: 'tech-pocketSprings',
    elbowY: 16,
  },
  {
    id: 'layer-5',
    num: '05',
    name: 'Base Estabilizadora Ortopédica HD-45',
    shortName: 'Base HD-45 6cm',
    category: 'Cimiento Estructural y Durabilidad',
    thickness: '6 cm',
    thicknessPx: 32,
    explodedZ: -165,
    assembledZ: -126,
    technicalSpec: 'Fieltro Termofijado + Cimiento de Alta Densidad — 120,000 Ciclos',
    badge: 'Sustentación Estructural',
    description:
      'Cimiento rígido de alta densidad diseñado para soportar más de 120,000 ciclos continuos de carga sin deformación dimensional. Protege la matriz de resortes y garantiza la estabilidad del conjunto por más de 15 años.',
    composition: ['Espuma HD-45 Ortopédica', 'Fieltro Termofijado 800g', 'Barrera Antideslizante'],
    topBg: 'linear-gradient(135deg, #0D1E4E 0%, #07112E 60%, #030818 100%)',
    topBorder: '#1A2E6B',
    frontBg: 'linear-gradient(180deg, #0B173B 0%, #02050D 100%)',
    leftBg: 'linear-gradient(180deg, #070F28 0%, #010309 100%)',
    svgPatternId: 'tech-hd45Grid',
    elbowY: 32,
  },
]

export function TechnicalDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageViewportRef = useRef<HTMLDivElement>(null)

  // Selection state
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-4')
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)

  // Manual assembly override: null means driven by scroll, number [0..1] means user controlled
  const [manualAssemblyFactor, setManualAssemblyFactor] = useState<number | null>(null)

  // Interactive mouse tilt for subtle parallax
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Responsive scale factor for small screens
  const [responsiveScale, setResponsiveScale] = useState<number>(1)

  // Scroll synchronization: tracks the scroll position of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Map scroll progress to assembly factor (0 = fully exploded, 1 = fully assembled)
  const scrollAssemblyFactor = useTransform(scrollYProgress, [0.15, 0.45], [0, 1])

  // Current raw target factor
  const [effectiveFactor, setEffectiveFactor] = useState<number>(0)

  useEffect(() => {
    if (manualAssemblyFactor !== null) {
      setEffectiveFactor(manualAssemblyFactor)
      return
    }

    const unsubscribe = scrollAssemblyFactor.on('change', (latest) => {
      setEffectiveFactor(Math.max(0, Math.min(1, latest)))
    })

    return () => unsubscribe()
  }, [manualAssemblyFactor, scrollAssemblyFactor])

  // Silky smooth spring for assembly animation (60fps physics)
  const animatedFactor = useSpring(effectiveFactor, {
    stiffness: 85,
    damping: 18,
    mass: 0.7,
  })

  const [currentProgress, setCurrentProgress] = useState<number>(0)
  useEffect(() => {
    const unsub = animatedFactor.on('change', (v) => {
      setCurrentProgress(Math.max(0, Math.min(1, v)))
    })
    return () => unsub()
  }, [animatedFactor])

  // Handle responsive scaling via ResizeObserver
  const handleResize = useCallback(() => {
    if (!stageViewportRef.current) return
    const containerWidth = stageViewportRef.current.clientWidth
    if (containerWidth < 680) {
      // Scale down proportionally down to ~0.50 on small phones
      const calculatedScale = Math.max(0.5, Math.min(1, containerWidth / 650))
      setResponsiveScale(calculatedScale)
    } else {
      setResponsiveScale(1)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Parallax mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMouseTilt({ x: x * 6, y: -y * 5 })
  }

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 })
    setHoveredLayerId(null)
  }

  const activeLayer =
    TECHNICAL_LAYERS.find((l) => l.id === activeLayerId) || TECHNICAL_LAYERS[3]

  // Dimension constants for the 3D mattress
  const SLAB_WIDTH = 290
  const SLAB_HEIGHT = 195

  return (
    <div ref={containerRef} className="w-full select-none">
      {/* ── EMBEDDED PROCEDURAL SVG TEXTURE DEFINITIONS (NO EXTERNAL IMAGES) ── */}
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Capa 1: Capitoné de Rombos Continuos (Tencel Lyocell) */}
          <pattern
            id="tech-tencelQuilt"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M14 0 L28 14 L14 28 L0 14 Z"
              fill="none"
              stroke="#C5A059"
              strokeWidth="0.85"
              strokeOpacity="0.4"
            />
            <path
              d="M14 6 L22 14 L14 22 L6 14 Z"
              fill="none"
              stroke="#C5A059"
              strokeWidth="0.4"
              strokeOpacity="0.25"
              strokeDasharray="1.5 2.5"
            />
            <circle cx="14" cy="14" r="1.6" fill="#C5A059" fillOpacity="0.85" />
            <path
              d="M12 14 H16 M14 12 V16"
              stroke="#FFFFFF"
              strokeWidth="0.6"
              strokeOpacity="0.75"
            />
          </pattern>

          {/* Capa 2: Micro-porosidad Viscoelástica Gravedad Cero */}
          <pattern
            id="tech-memoryFoamPores"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="9" cy="9" r="2.2" fill="#755214" fillOpacity="0.45" />
            <circle cx="9" cy="9" r="1.2" fill="#4A330B" fillOpacity="0.55" />
            <circle cx="0" cy="0" r="1.5" fill="#755214" fillOpacity="0.35" />
            <circle cx="18" cy="0" r="1.5" fill="#755214" fillOpacity="0.35" />
            <circle cx="0" cy="18" r="1.5" fill="#755214" fillOpacity="0.35" />
            <circle cx="18" cy="18" r="1.5" fill="#755214" fillOpacity="0.35" />
            <circle cx="9" cy="0" r="1" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="0" cy="9" r="1" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="18" cy="9" r="1" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="9" cy="18" r="1" fill="#FFFFFF" fillOpacity="0.25" />
          </pattern>

          {/* Capa 3: Canales de Perfilado Biomecánico HR-40 (7 Zonas) */}
          <pattern
            id="tech-hr40Channels"
            width="24"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="16"
              x2="24"
              y2="16"
              stroke="#091438"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="16"
              x2="24"
              y2="16"
              stroke="#C5A059"
              strokeWidth="0.75"
              strokeDasharray="3 4"
              strokeOpacity="0.45"
            />
            <circle cx="12" cy="7" r="1.2" fill="#3A529B" />
            <circle cx="12" cy="25" r="1.2" fill="#3A529B" />
          </pattern>

          {/* Capa 4: Matriz de 800 Resortes Pocket Ensacados Independientes */}
          <pattern
            id="tech-pocketSprings"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="18"
              cy="18"
              r="16.5"
              fill="#0A1848"
              stroke="#C5A059"
              strokeWidth="0.9"
              strokeOpacity="0.4"
              strokeDasharray="4 2.5"
            />
            <circle
              cx="18"
              cy="18"
              r="12.5"
              fill="none"
              stroke="#D4B576"
              strokeWidth="1.6"
              strokeOpacity="0.9"
            />
            <circle
              cx="18"
              cy="18"
              r="8"
              fill="none"
              stroke="#C5A059"
              strokeWidth="1.3"
              strokeOpacity="0.8"
            />
            <circle
              cx="18"
              cy="18"
              r="4"
              fill="none"
              stroke="#FFE7A3"
              strokeWidth="1.1"
              strokeOpacity="0.95"
            />
            <circle cx="18" cy="18" r="1.5" fill="#FFFFFF" />
            <line
              x1="18"
              y1="0"
              x2="18"
              y2="2"
              stroke="#C5A059"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="18"
              y1="34"
              x2="18"
              y2="36"
              stroke="#C5A059"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="0"
              y1="18"
              x2="2"
              y2="18"
              stroke="#C5A059"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <line
              x1="34"
              y1="18"
              x2="36"
              y2="18"
              stroke="#C5A059"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </pattern>

          {/* Capa 5: Malla Estructural Ortopédica HD-45 */}
          <pattern
            id="tech-hd45Grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0 L20 20 M20 0 L0 20"
              stroke="#162A63"
              strokeWidth="0.8"
              strokeOpacity="0.55"
            />
            <circle cx="10" cy="10" r="1.2" fill="#C5A059" fillOpacity="0.35" />
            <path
              d="M0 10 H2 M18 10 H20 M10 0 V2 M10 18 V20"
              stroke="#C5A059"
              strokeWidth="0.7"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
      </svg>

      {/* ── INJECTED 3D CSS RULES PARA VOLUMEN CON ::before Y ::after ────────── */}
      <style>{`
        .isometric-viewport {
          perspective: 1400px;
          perspective-origin: 50% 45%;
        }
        .isometric-assembly-rig {
          transform-style: preserve-3d;
          will-change: transform;
        }
        .mattress-slab-3d {
          position: absolute;
          top: 0;
          left: 0;
          transform-style: preserve-3d;
          will-change: transform;
          border-radius: 4px;
        }
        /* Cara lateral frontal (bottom face) para espesor físico 3D */
        .mattress-slab-3d::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: var(--slab-thickness, 20px);
          transform-origin: bottom center;
          transform: rotateX(-90deg);
          background: var(--slab-front-bg, #0A1B54);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.7);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-bottom: 1px solid rgba(0, 0, 0, 0.8);
          pointer-events: none;
        }
        /* Cara lateral izquierda (left face) para sombra direccional y volumen */
        .mattress-slab-3d::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: var(--slab-thickness, 20px);
          height: 100%;
          transform-origin: left center;
          transform: rotateY(-90deg);
          background: var(--slab-left-bg, #07133B);
          box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.2), inset -1px 0 0 rgba(0, 0, 0, 0.8);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          border-right: 1px solid rgba(0, 0, 0, 0.85);
          pointer-events: none;
        }
      `}</style>

      {/* ── CONTROL HUD BAR SUPERIOR ──────────────────────────────────────── */}
      <div className="border border-white/10 bg-[#07133B]/80 backdrop-blur-md p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C5A059]" />
            </span>
            <div>
              <p className="font-body text-2xs uppercase tracking-[0.22em] text-white font-medium">
                Diagrama Isométrico 3D — Corte Técnico
              </p>
              <p className="font-mono text-2xs text-[#C5A059]">
                5 Capas Biomecánicas • 36 cm Altura Certificada
              </p>
            </div>
          </div>

          {/* Interactive Assembly Controls (Scrubber & Mode Buttons) */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Quick Toggle Buttons */}
            <div className="flex items-center border border-white/15 bg-[#0A1B54]/60 p-0.5">
              <button
                type="button"
                onClick={() => setManualAssemblyFactor(0)}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 ${
                  currentProgress < 0.4
                    ? 'bg-[#C5A059] text-[#0A1B54] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Vista Explotada
              </button>
              <button
                type="button"
                onClick={() => setManualAssemblyFactor(1)}
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 ${
                  currentProgress >= 0.7
                    ? 'bg-[#C5A059] text-[#0A1B54] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Ensamblado
              </button>
            </div>

            {/* Re-sync with scroll button if manual override is active */}
            {manualAssemblyFactor !== null && (
              <button
                type="button"
                onClick={() => setManualAssemblyFactor(null)}
                title="Sincronizar de nuevo con el scroll"
                className="flex items-center gap-1 border border-[#C5A059]/40 bg-[#C5A059]/10 px-2.5 py-1 font-mono text-[10px] text-[#C5A059] hover:bg-[#C5A059]/20 transition-colors"
              >
                <span className="text-xs">↻</span> Scroll Auto
              </button>
            )}
          </div>
        </div>

        {/* Live Assembly Factor Scrub Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase">
            Despiece:
          </span>
          <div className="relative flex-1 h-1.5 bg-white/10 overflow-hidden cursor-pointer">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#C5A059] to-[#E5C378]"
              style={{ width: `${(1 - currentProgress) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-[#C5A059] font-bold min-w-[36px] text-right">
            {Math.round((1 - currentProgress) * 100)}%
          </span>
        </div>
      </div>

      {/* ── STAGE VIEWPORT 3D (ESCALABLE RESPONSIVAMENTE) ────────────────── */}
      <div
        ref={stageViewportRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full overflow-visible border-x border-b border-white/10 bg-gradient-to-b from-[#07133B]/60 via-[#0A1B54]/40 to-[#07133B]/90 flex items-center justify-center py-6 transition-all"
        style={{
          minHeight: `${480 * responsiveScale + 40}px`,
        }}
      >
        {/* Subtle Ambient Engineering Coordinate Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(197,160,89,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* 3D Scaled Canvas Container */}
        <div
          style={{
            width: '640px',
            height: '480px',
            transform: `scale(${responsiveScale})`,
            transformOrigin: 'top center',
          }}
          className="relative flex items-center justify-center"
        >
          {/* Isometric Viewport with Perspective */}
          <div className="isometric-viewport relative w-full h-full flex items-center justify-center">
            {/* The 3D Mattress Assembly Rig */}
            <motion.div
              animate={{
                rotateX: 58 + mouseTilt.y,
                rotateZ: -42 + mouseTilt.x,
              }}
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 20,
              }}
              style={{
                width: `${SLAB_WIDTH}px`,
                height: `${SLAB_HEIGHT}px`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
              }}
              className="isometric-assembly-rig relative"
            >
              {/* Ground Ambient Mattress Shadow (Moves with assembly factor) */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: `${SLAB_WIDTH + 40}px`,
                  height: `${SLAB_HEIGHT + 40}px`,
                  transform: 'translateZ(-195px)',
                  transformStyle: 'preserve-3d',
                  borderRadius: '16px',
                  background:
                    'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(7,19,59,0.5) 45%, transparent 75%)',
                  filter: 'blur(14px)',
                  pointerEvents: 'none',
                }}
                animate={{
                  scale: 1 - currentProgress * 0.12,
                  opacity: 0.7 + currentProgress * 0.25,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* ── 5 3D MATTRESS LAYERS WITH VOLUMETRIC WALLS & LEADER LINES ── */}
              {TECHNICAL_LAYERS.map((layer) => {
                const isActive = layer.id === activeLayerId
                const isHovered = layer.id === hoveredLayerId

                // Calculate current Z coordinate via continuous interpolation
                const baseZ =
                  layer.explodedZ * (1 - currentProgress) +
                  layer.assembledZ * currentProgress

                // Active elevation boost in exploded view
                const activeElevation = isActive && currentProgress < 0.65 ? 14 : 0
                const hoverElevation = isHovered && !isActive ? 6 : 0
                const finalZ = baseZ + activeElevation + hoverElevation

                // Leader line dynamic elbow offset for perfect vertical fanning
                const dynamicElbowY = layer.elbowY * currentProgress

                return (
                  <motion.div
                    key={layer.id}
                    animate={{
                      z: finalZ,
                      scale: isActive ? 1.025 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 110,
                      damping: 18,
                      mass: 0.75,
                    }}
                    style={
                      {
                        width: `${SLAB_WIDTH}px`,
                        height: `${SLAB_HEIGHT}px`,
                        '--slab-thickness': `${layer.thicknessPx}px`,
                        '--slab-front-bg': layer.frontBg,
                        '--slab-left-bg': layer.leftBg,
                      } as React.CSSProperties
                    }
                    className={`mattress-slab-3d cursor-pointer transition-shadow duration-300 ${
                      isActive
                        ? 'shadow-[0_0_25px_rgba(197,160,89,0.45)]'
                        : 'hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    }`}
                    onClick={() => setActiveLayerId(layer.id)}
                    onMouseEnter={() => setHoveredLayerId(layer.id)}
                    onMouseLeave={() => setHoveredLayerId(null)}
                  >
                    {/* ── TOP FACE (CARA SUPERIOR CON TEXTURA VECTORIAL SVG PURA) ── */}
                    <div
                      className={`relative h-full w-full rounded-[3px] border transition-all duration-300 overflow-hidden ${
                        isActive
                          ? 'border-[#C5A059] ring-2 ring-[#C5A059]/60'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{
                        background: layer.topBg,
                      }}
                    >
                      {/* SVG Injected Pattern Fill */}
                      <svg
                        className="absolute inset-0 h-full w-full pointer-events-none"
                        style={{
                          opacity: layer.id === 'layer-1' ? 0.65 : 0.45,
                        }}
                      >
                        <rect
                          width="100%"
                          height="100%"
                          fill={`url(#${layer.svgPatternId})`}
                        />
                      </svg>

                      {/* Specialized Material Overlays */}
                      {layer.id === 'layer-3' && (
                        /* Biomechanical 7-Zone Longitudinal Ribs */
                        <div className="absolute inset-0 flex justify-between px-3 py-1 pointer-events-none opacity-40">
                          {['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7'].map((zone, zi) => (
                            <div
                              key={zone}
                              className="h-full flex flex-col justify-between items-center border-r border-[#C5A059]/30 pr-1"
                            >
                              <span className="font-mono text-[7px] text-[#C5A059] font-bold">
                                {zone}
                              </span>
                              <div
                                className="w-0.5 h-6 bg-[#C5A059]/30 rounded"
                                style={{ height: `${20 + (zi % 3) * 8}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {layer.id === 'layer-4' && (
                        /* Center Gold Matrix Badge for Pocket Springs */
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="border border-[#C5A059]/40 bg-[#07133B]/80 px-2 py-0.5 backdrop-blur-sm">
                            <span className="font-mono text-[8px] uppercase tracking-widest text-[#C5A059] font-bold">
                              800 INDIVIDUAL COILS
                            </span>
                          </div>
                        </div>
                      )}

                      {layer.id === 'layer-5' && (
                        /* HD-45 Monolithic Technical Foundation Silkscreen */
                        <div className="absolute inset-x-3 bottom-2 flex justify-between items-center pointer-events-none">
                          <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#C5A059]/50">
                            HD-45 HIGH RESILIENCE BASE • ISO 9001
                          </span>
                          <span className="font-mono text-[7px] text-white/40">
                            120,000 CYCLES
                          </span>
                        </div>
                      )}

                      {/* Technical Layer Badge Chip on Top-Left */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#07133B]/90 px-1.5 py-0.5 border border-white/20">
                        <span className="font-mono text-[9px] font-bold text-[#C5A059]">
                          {layer.num}
                        </span>
                        <span className="font-mono text-[8px] text-white/80">
                          {layer.thickness}
                        </span>
                      </div>

                      {/* Chamfer Specular Edge Highlight */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                    </div>

                    {/* ── BILLBOARDED LEADER LINE & FLOATING TEXT LABEL ────────── */}
                    {/* Counter-rotation to cancel isometric camera and face screen flat */}
                    <div
                      className="absolute right-0 bottom-0 pointer-events-none"
                      style={{
                        transform: 'rotateZ(42deg) rotateX(-58deg)',
                        transformOrigin: '0 0',
                        zIndex: isActive ? 50 : 20,
                      }}
                    >
                      {/* SVG 1px Vector Leader Line (Línea Guía) */}
                      <svg
                        className="overflow-visible pointer-events-none"
                        style={{ position: 'absolute', top: 0, left: 0 }}
                      >
                        {/* Terminal Anchor Dot on Layer 3D Edge */}
                        <circle
                          cx="0"
                          cy="0"
                          r={isActive ? '3.5' : '2.5'}
                          fill={isActive ? '#C5A059' : '#0A1B54'}
                          stroke="#C5A059"
                          strokeWidth="1.5"
                        />
                        {isActive && (
                          <circle
                            cx="0"
                            cy="0"
                            r="6"
                            fill="none"
                            stroke="#C5A059"
                            strokeWidth="0.8"
                            strokeOpacity="0.6"
                            className="animate-ping"
                          />
                        )}

                        {/* 1px Leader Line with Dynamic Fanning Elbow Joint */}
                        <path
                          d={`M 0 0 L 32 0 L 56 ${dynamicElbowY} L 82 ${dynamicElbowY}`}
                          fill="none"
                          stroke={isActive ? '#C5A059' : 'rgba(255,255,255,0.35)'}
                          strokeWidth={isActive ? '1.5' : '1'}
                          strokeDasharray={isActive ? 'none' : '3 3'}
                        />

                        {/* Label Entry Pin Dot */}
                        <circle
                          cx="82"
                          cy={dynamicElbowY}
                          r="2"
                          fill={isActive ? '#C5A059' : 'rgba(255,255,255,0.5)'}
                        />
                      </svg>

                      {/* Floating Text Card Attached at (86px, dynamicElbowY) */}
                      <div
                        style={{
                          transform: `translate(86px, calc(${dynamicElbowY}px - 50%))`,
                        }}
                        className="pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLayerId(layer.id)
                        }}
                      >
                        <div
                          className={`group/label cursor-pointer whitespace-nowrap border px-3 py-1.5 backdrop-blur-md transition-all duration-300 ${
                            isActive
                              ? 'border-[#C5A059] bg-[#07133B]/95 shadow-[0_4px_16px_rgba(197,160,89,0.3)]'
                              : 'border-white/15 bg-[#0A1B54]/80 hover:border-white/40 hover:bg-[#0D2266]/90'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#C5A059]">
                              {layer.num}
                            </span>
                            <span
                              className={`font-body text-xs font-medium transition-colors ${
                                isActive ? 'text-white' : 'text-white/80 group-hover/label:text-white'
                              }`}
                            >
                              {layer.shortName}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#C5A059]/80 border-l border-white/15 pl-1.5">
                              {layer.thickness}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TECHNICAL DOSSIER HUD CARD (DETALLE TÉCNICO DE LA CAPA ACTIVA) ─── */}
      <div className="border-x border-b border-white/10 bg-[#07133B]/90 p-5 sm:p-6 backdrop-blur-md">
        {/* Layer Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10 scrollbar-none">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 mr-2 flex-shrink-0">
            Capas:
          </span>
          {TECHNICAL_LAYERS.map((layer) => {
            const isChipActive = layer.id === activeLayerId
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayerId(layer.id)}
                className={`flex-shrink-0 px-3 py-1.5 font-mono text-[11px] border transition-all duration-200 flex items-center gap-2 ${
                  isChipActive
                    ? 'border-[#C5A059] bg-[#C5A059]/15 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="text-[#C5A059]">{layer.num}</span>
                <span>{layer.shortName}</span>
              </button>
            )
          })}
        </div>

        {/* Active Layer In-Depth Technical Specification */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#C5A059]">
                    Capa {activeLayer.num}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]/80">
                    {activeLayer.badge}
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-normal text-white mt-0.5">
                  {activeLayer.name}
                </h3>
              </div>
              <div className="border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1.5 self-start sm:self-auto">
                <span className="font-mono text-xs text-[#C5A059] font-bold">
                  {activeLayer.thickness} Espesor Real
                </span>
              </div>
            </div>

            <p className="font-body text-xs sm:text-sm text-white/80 leading-relaxed max-w-3xl">
              {activeLayer.description}
            </p>

            {/* Certified Technical Metric */}
            <div className="border-l-2 border-[#C5A059] bg-[#0A1B54]/40 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 block">
                Especificación Industrial & Densidad:
              </span>
              <span className="font-body text-xs text-white/90 font-medium">
                {activeLayer.technicalSpec}
              </span>
            </div>

            {/* Chemical & Mechanical Composition Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-body text-[10px] uppercase tracking-wider text-white/40 mr-1">
                Composición:
              </span>
              {activeLayer.composition.map((comp) => (
                <span
                  key={comp}
                  className="border border-[#C5A059]/30 bg-[#C5A059]/10 px-2.5 py-1 font-body text-[11px] text-[#C5A059]"
                >
                  ✓ {comp}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Industrial Certification Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 text-2xs font-body text-white/40 gap-2">
          <span>Garantía biomecánica certificada por 10 a 15 años • ISO 9001</span>
          <span className="text-[#C5A059]">
            Manufacturado en planta industrial Oasis — Bogotá D.C.
          </span>
        </div>
      </div>
    </div>
  )
}
