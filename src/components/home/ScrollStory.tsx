'use client'
import { useRef } from 'react'
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

function StoryStepItem({
  step,
  index,
  totalSteps,
  scrollYProgress,
}: {
  step: StoryStep
  index: number
  totalSteps: number
  scrollYProgress: MotionValue<number>
}) {
  const start = index / totalSteps
  const end = (index + 1) / totalSteps
  const opacity = useTransform(scrollYProgress, [start, start + 0.08, end - 0.08, end], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [start, start + 0.1, end - 0.08, end], [40, 0, 0, -40])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center px-4 lg:px-12 pointer-events-none"
    >
      <p className="font-display text-[90px] sm:text-[140px] font-light leading-none text-white/5 select-none">
        {step.step}
      </p>
      <div className="-mt-8 sm:-mt-12 space-y-3 sm:space-y-4 border-l border-[#C5A059]/40 pl-6 sm:pl-8 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Etapa {step.step} de 04
          </p>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-white max-w-lg">
          {step.title}
        </h3>
        <p className="font-body text-xs sm:text-sm text-white/70 max-w-md leading-relaxed">
          {step.body}
        </p>
        <p className="font-body text-xs italic text-[#C5A059]/80 pt-1">
          — {step.highlight}
        </p>
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
      className="relative"
      style={{ height: `${STORY_STEPS.length * 100}vh` }}
    >
      <div className="sticky top-0 flex min-h-screen flex-col lg:flex-row overflow-hidden justify-center">
        {/* Left: fixed narrative */}
        <div className="flex w-full lg:w-5/12 flex-col justify-center px-6 lg:px-16 pt-20 lg:pt-0">
          <div>
            <motion.span
              className="inline-block font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Arquitectura de Manufactura
            </motion.span>
          </div>
          <div className="mt-3">
            <motion.h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Del acero y látex<br />a tu dormitorio.
            </motion.h2>
          </div>
          <p className="mt-4 font-body text-xs sm:text-sm text-white/60 max-w-sm leading-relaxed">
            Nuestro proceso de 4 etapas donde la ingeniería industrial se une a la confección textil de precisión.
          </p>

          {/* Progress bar */}
          <div className="mt-8 lg:mt-12 h-px w-full max-w-xs bg-white/10">
            <motion.div
              className="h-full bg-[#C5A059]"
              style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            />
          </div>
        </div>

        {/* Right: scrolling steps */}
        <div className="relative w-full lg:w-7/12 flex-1 overflow-hidden px-6 lg:px-16 flex items-center justify-center">
          {STORY_STEPS.map((step, i) => (
            <StoryStepItem
              key={step.step}
              step={step}
              index={i}
              totalSteps={STORY_STEPS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
