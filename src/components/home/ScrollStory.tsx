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
    body: 'Inspeccionamos cada lote de espuma viscoelástica, resortes tipo Bonell y Pocket, y telas Jacquard antes de entrar a línea. Cero materiales genéricos o reciclados sin trazabilidad.',
    highlight: 'Pureza de origen certificada.',
  },
  {
    step: '02',
    title: 'Ensamblado Artesanal por Capas',
    body: 'Cada colchón se construye a mano con secuencia matemática de densidades y refuerzos ortopédicos en Cazata D120 para máxima durabilidad.',
    highlight: 'Precisión milimétrica por capa.',
  },
  {
    step: '03',
    title: 'Prueba de Resistencia Dinámica',
    body: 'Sometemos cada modelo a rigurosos ciclos de fatiga mecánica en nuestro banco de pruebas de planta antes de autorizar el despacho final.',
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
        <p className="font-display text-[72px] sm:text-[100px] lg:text-[130px] font-light leading-none text-[#0A1B54]/5 select-none absolute -top-8 sm:-top-14 lg:-top-18 left-0 pointer-events-none">
          {step.step}
        </p>
        <div className="relative z-10 space-y-2 sm:space-y-3.5 border-l-2 border-[#C5A059] pl-5 sm:pl-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
            <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] font-medium">
              Etapa {step.step} de 04
            </p>
          </div>
          <h3 className="font-display text-xl sm:text-2xl lg:text-4xl font-normal text-[#0A1B54] max-w-lg leading-snug">
            {step.title}
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#0A1B54]/75 max-w-md leading-relaxed">
            {step.body}
          </p>
          <p className="font-body text-xs italic text-[#C5A059] font-medium pt-0.5">
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
      className="relative w-full bg-white border-t border-[#0A1B54]/10"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Columna Izquierda: Narrativa Maestra Fija y Barra de Progreso */}
          <div className="w-full lg:col-span-5 flex flex-col justify-center z-10">
            <div>
              <span className="inline-block font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                Arquitectura de Manufactura
              </span>
            </div>
            <div className="mt-3">
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#0A1B54]">
                Del acero y espuma<br />a tu dormitorio.
              </h2>
            </div>
            <p className="mt-3 sm:mt-4 font-body text-xs sm:text-sm text-[#0A1B54]/70 max-w-sm leading-relaxed">
              Nuestro proceso de 4 etapas donde la ingeniería industrial se une a la confección textil de precisión en Bogotá.
            </p>

            {/* Indicador de Progreso Sincronizado */}
            <div className="mt-6 sm:mt-10 lg:mt-12 w-full max-w-xs">
              <div className="h-1 w-full bg-[#0A1B54]/10 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-[#C5A059] rounded-full"
                  style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#0A1B54]/50 uppercase tracking-wider">
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
