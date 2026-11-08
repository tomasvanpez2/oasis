'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface StoryStep {
  step: string
  title: string
  body: string
  highlight: string
}

const STORY_STEPS: StoryStep[] = [
  {
    step: '01',
    title: 'Selección Rigurosa de Materiales',
    body: 'Inspeccionamos cada lote de espuma viscoelástica, látex Dunlop y acero templado antes de entrar a línea. Cero materiales genéricos o reciclados sin trazabilidad.',
    highlight: 'Pureza de origen certificada.',
  },
  {
    step: '02',
    title: 'Ensamblado Artesanal por Capas',
    body: 'Cada colchón se construye a mano con secuencia matemática de densidades. La unión por termofusión sin solventes tóxicos asegura la cohesión molecular del núcleo.',
    highlight: 'Precisión milimétrica por capa.',
  },
  {
    step: '03',
    title: 'Prueba de Resistencia Dinámica',
    body: 'Sometemos cada modelo a 100,000 ciclos de compresión robotizada bajo rodillos de 140 kg en nuestro banco de pruebas antes de autorizar el etiquetado final.',
    highlight: 'Garantía real probada en máquina.',
  },
  {
    step: '04',
    title: 'Entrega Directa sin Intermediarios',
    body: 'De nuestra nave de confección en Bogotá directo a tu dormitorio. Eliminamos bodegajes intermedios y comisiones comerciales que inflan el precio.',
    highlight: 'Fábrica a hogar.',
  },
]

interface StepRangeConfig {
  inputRange: number[]
  opacityRange: number[]
  yRange: number[]
}

// Strict monotonic scroll ranges:
// - Step 01: Fully visible at scroll 0.00, holds solid until 0.18, cross-fades out by 0.26
// - Step 02: Cross-fades in from 0.19, solid from 0.27 to 0.43, cross-fades out by 0.51
// - Step 03: Cross-fades in from 0.44, solid from 0.52 to 0.68, cross-fades out by 0.76
// - Step 04: Cross-fades in from 0.69, solid from 0.77 to 1.00. Locks at full opacity (no empty gap).
const STEP_RANGES: StepRangeConfig[] = [
  {
    inputRange: [0.0, 0.18, 0.26],
    opacityRange: [1, 1, 0],
    yRange: [0, 0, -24],
  },
  {
    inputRange: [0.19, 0.27, 0.43, 0.51],
    opacityRange: [0, 1, 1, 0],
    yRange: [24, 0, 0, -24],
  },
  {
    inputRange: [0.44, 0.52, 0.68, 0.76],
    opacityRange: [0, 1, 1, 0],
    yRange: [24, 0, 0, -24],
  },
  {
    inputRange: [0.69, 0.77, 1.0],
    opacityRange: [0, 1, 1],
    yRange: [24, 0, 0],
  },
]

function StoryStepItem({
  step,
  index,
  scrollYProgress,
}: {
  step: StoryStep
  index: number
  scrollYProgress: MotionValue<number>
}) {
  const config = STEP_RANGES[index]
  const opacity = useTransform(scrollYProgress, config.inputRange, config.opacityRange)
  const y = useTransform(scrollYProgress, config.inputRange, config.yRange)
  const pointerEvents = useTransform(opacity, (val) => (val > 0.1 ? 'auto' : 'none'))

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-0 flex flex-col justify-center px-2 sm:px-6 lg:px-8"
    >
      <div className="relative">
        <p className="font-display text-[72px] sm:text-[100px] lg:text-[130px] font-light leading-none text-white/5 select-none absolute -top-8 sm:-top-14 lg:-top-18 left-0 pointer-events-none">
          {step.step}
        </p>
        <div className="relative z-10 space-y-2 sm:space-y-3.5 border-l-2 border-[#C5A059]/40 pl-5 sm:pl-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
            <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
              Etapa {step.step} de 04
            </p>
          </div>
          <h3 className="font-display text-xl sm:text-2xl lg:text-4xl font-normal text-white max-w-lg leading-snug">
            {step.title}
          </h3>
          <p className="font-body text-xs sm:text-sm text-white/70 max-w-md leading-relaxed">
            {step.body}
          </p>
          <p className="font-body text-xs italic text-[#C5A059]/90 pt-0.5">
            — {step.highlight}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#0A1B54]"
      style={{ height: '400vh' }}
    >
      {/* Centrado Sticky: estrictamente sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A1B54]">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Columna Izquierda: Narrativa Maestra Fija y Barra de Progreso */}
          <div className="w-full lg:col-span-5 flex flex-col justify-center z-10">
            <div>
              <span className="inline-block font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]">
                Arquitectura de Manufactura
              </span>
            </div>
            <div className="mt-3">
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
                Del acero y látex<br />a tu dormitorio.
              </h2>
            </div>
            <p className="mt-3 sm:mt-4 font-body text-xs sm:text-sm text-white/60 max-w-sm leading-relaxed">
              Nuestro proceso de 4 etapas donde la ingeniería industrial se une a la confección textil de precisión.
            </p>

            {/* Indicador de Progreso Sincronizado */}
            <div className="mt-6 sm:mt-10 lg:mt-12 w-full max-w-xs">
              <div className="h-0.5 w-full bg-white/10 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-[#C5A059] rounded-full"
                  style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-wider">
                <span>01 Inspección</span>
                <span>02 Ensamble</span>
                <span>03 Prueba</span>
                <span>04 Entrega</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Pasos Animados Secuencialmente */}
          <div className="relative w-full lg:col-span-7 h-[320px] sm:h-[360px] lg:h-[420px] flex items-center justify-center">
            {STORY_STEPS.map((step, i) => (
              <StoryStepItem
                key={step.step}
                step={step}
                index={i}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
