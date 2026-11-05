'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    topic: 'asesoria',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitted(true)
  }

  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-36 px-6 lg:px-16 overflow-hidden">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-10">
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body text-2xs uppercase tracking-[0.25em] text-[#C5A059]"
            >
              Canal Directo de Planta
            </motion.p>
            <div className="mt-3">
              <TextSplitReveal
                text="Contacto & Fábrica."
                as="h1"
                className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-tight"
                delay={0.1}
                stagger={0.06}
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 font-body text-sm sm:text-base text-white/70 max-w-xl leading-relaxed"
            >
              Atención directa por parte de nuestro equipo de manufactura e ingeniería biomecánica en Bogotá. Sin call centers externos ni operadores automatizados.
            </motion.p>
          </div>

          {/* Master Grid: Info Left & Form Right */}
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            
            {/* Left Column: Direct Channels & Plant Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="lg:col-span-5 space-y-8"
            >
              {/* Plant Location Card */}
              <div className="border border-white/10 bg-[#07133B]/60 p-8">
                <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                  01 / Instalación Industrial
                </span>
                <h3 className="mt-4 font-display text-2xl font-normal text-white">
                  Planta Principal Bogotá
                </h3>
                <p className="mt-3 font-body text-xs sm:text-sm text-white/70 leading-relaxed">
                  Cra. 68D #17-25, Parque Industrial Montevideo / Fontibón<br />
                  Bogotá D.C., Colombia — Código Postal 110931
                </p>
                <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="font-body text-2xs uppercase tracking-wider text-white/40">
                    Área Operativa
                  </span>
                  <span className="font-mono text-2xs text-[#C5A059]">
                    2,400 m² de Manufactura
                  </span>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="border border-white/10 bg-[#07133B]/60 p-8 space-y-6">
                <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                  02 / Canales de Atención
                </span>

                <div className="space-y-4">
                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                      Línea PBX Fija (Bogotá)
                    </span>
                    <a
                      href="tel:+576017452890"
                      className="font-display text-xl text-white hover:text-[#C5A059] transition-colors"
                    >
                      +57 (601) 745 2890
                    </a>
                  </div>

                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                      Línea Directa WhatsApp & Asesoría Técnica
                    </span>
                    <a
                      href="https://wa.me/573108529410?text=Hola%20Oasis%20Colchones,%20deseo%20asesor%C3%ADa%20t%C3%A9cnica%20sobre%20un%20colch%C3%B3n"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-xl text-[#C5A059] hover:text-white transition-colors"
                    >
                      +57 310 852 9410
                    </a>
                  </div>

                  <div>
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                      Correo Corporativo & Soporte
                    </span>
                    <a
                      href="mailto:atencion@oasiscolchones.co"
                      className="font-mono text-sm text-white/80 hover:text-[#C5A059] transition-colors"
                    >
                      atencion@oasiscolchones.co
                    </a>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="font-body text-2xs uppercase tracking-wider text-white/40 block">
                      Horario de Planta y Recepción
                    </span>
                    <p className="mt-1 font-body text-xs text-white/70">
                      Lunes a Viernes: 8:00 a.m. – 5:00 p.m.<br />
                      Sábados: 8:00 a.m. – 1:00 p.m.
                    </p>
                  </div>
                </div>
              </div>

              {/* Protocol Note */}
              <div className="border-l-2 border-[#C5A059] bg-[#0A1B54]/40 p-4">
                <p className="font-body text-xs text-white/75 leading-relaxed">
                  <strong className="text-white">Visitas Técnicas a Planta:</strong> Para conocer los procesos de confección en persona en nuestra nave de Bogotá, por favor agenda cita previa con 24 horas de antelación para coordinar los protocolos de seguridad industrial de calzado y protección visual.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Interactive Direct Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="border border-white/10 bg-[#07133B]/80 p-8 sm:p-12">
                <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                  03 / Radicar Consulta
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                  Formulario Directo a Producción
                </h2>
                <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                  Tu mensaje es recibido por el equipo técnico en planta. Respuesta oficial en menos de 2 horas hábiles.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-10 border border-[#C5A059]/40 bg-[#C5A059]/10 p-8 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C5A059] text-[#0A1B54] font-bold text-lg">
                      ✓
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-white">
                      Mensaje Radicado en Fábrica
                    </h3>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                      Gracias, {formData.name}. Hemos recibido tu solicitud. Uno de nuestros ingenieros de planta o asesores técnicos te contactará al teléfono {formData.phone} o correo {formData.email}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 border border-white/30 px-6 py-2.5 font-body text-xs uppercase tracking-widest text-white hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                    >
                      Enviar otra consulta
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-white/20 bg-white/5 px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none focus:border-[#C5A059] transition-colors"
                          placeholder="Carlos Morales"
                        />
                      </div>
                      <div>
                        <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-white/20 bg-white/5 px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none focus:border-[#C5A059] transition-colors"
                          placeholder="carlos@empresa.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                          Número Celular / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full border border-white/20 bg-white/5 px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none focus:border-[#C5A059] transition-colors"
                          placeholder="310 852 9410"
                        />
                      </div>
                      <div>
                        <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                          Ciudad de Destino
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full border border-white/20 bg-white/5 px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none focus:border-[#C5A059] transition-colors"
                          placeholder="Bogotá, Medellín, Cali, Barranquilla..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                        Tipo de Consulta
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full border border-white/20 bg-[#0A1B54] px-4 py-3 font-body text-sm text-white outline-none focus:border-[#C5A059] transition-colors"
                      >
                        <option value="asesoria">Asesoría Técnica de Firmeza Biomecánica</option>
                        <option value="medidas">Cotización de Medidas Especiales o Fuera de Estándar</option>
                        <option value="despacho">Estado de Despacho Logístico</option>
                        <option value="garantia">Activación de Garantía Industrial de Fábrica</option>
                        <option value="corporativo">Pedidos Corporativos / Hotelería</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-body text-2xs uppercase tracking-wider text-white/50 mb-2">
                        Detalle de tu Consulta o Requerimiento *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full border border-white/20 bg-white/5 px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none focus:border-[#C5A059] transition-colors resize-none"
                        placeholder="Describe el modelo de tu interés, tu peso/altura aproximados para recomendación ergonómica, o cualquier duda sobre el despacho a tu ciudad..."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full border border-[#C5A059] bg-[#C5A059] py-4 font-body text-xs uppercase tracking-widest text-[#0A1B54] font-semibold transition-all duration-300 hover:bg-white hover:border-white"
                      >
                        Enviar Consulta a Fábrica
                      </button>
                      <p className="mt-3 text-center font-body text-[11px] text-white/40">
                        Al enviar, autorizas el tratamiento de tus datos bajo la Ley 1581 de 2012 exclusivamente para responder a tu inquietud.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
