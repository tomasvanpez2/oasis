'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

type LegalTab = 'terminos' | 'garantia' | 'envios' | 'retracto' | 'privacidad'

export default function LegalesPage() {
  const [activeTab, setActiveTab] = useState<LegalTab>('garantia')

  const TABS: { id: LegalTab; label: string; number: string }[] = [
    { id: 'garantia', label: 'Garantía Industrial (10-15 Años)', number: '01' },
    { id: 'envios', label: 'Política de Envíos y Fletes', number: '02' },
    { id: 'terminos', label: 'Términos y Condiciones Generales', number: '03' },
    { id: 'retracto', label: 'Derecho de Retracto (Ley 1480)', number: '04' },
    { id: 'privacidad', label: 'Tratamiento de Datos (Ley 1581)', number: '05' },
  ]

  return (
    <main className="bg-[#0A1B54] min-h-screen">
      <Header />

      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-36 px-6 lg:px-16 overflow-hidden">
        {/* Architectural 1px grid guides */}
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
              Marco Jurídico & Garantías Contractuales
            </motion.p>
            <div className="mt-3">
              <TextSplitReveal
                text="Políticas & Términos Legales."
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
              className="mt-6 font-body text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed"
            >
              Cero letra pequeña ambigua. Documentamos con transparencia el marco regulatorio bajo el Estatuto del Consumidor en Colombia (Ley 1480 de 2011) y la Ley de Habeas Data (Ley 1581 de 2012).
            </motion.p>
          </div>

          {/* Identification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 border border-white/10 bg-[#07133B]/60 p-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <p className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                Razón Social del Fabricante:
              </p>
              <p className="font-body text-sm text-white font-medium">
                Oasis Colchones S.A.S. — NIT: 901.482.391-4
              </p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="font-mono text-2xs uppercase tracking-wider text-white/40">
                Sede Fabril Principal:
              </p>
              <p className="font-body text-sm text-white/80">
                Bogotá D.C. — Parque Industrial Fontibón / Montevideo
              </p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="font-mono text-2xs uppercase tracking-wider text-white/40">
                Autoridad de Supervisión:
              </p>
              <p className="font-body text-sm text-white/80">
                Superintendencia de Industria y Comercio (SIC)
              </p>
            </div>
          </motion.div>

          {/* Master Grid with Navigation Sidebar & Content */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 sticky top-28 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 block mb-4 px-2">
                Índice de Cláusulas y Protocolos
              </span>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 border transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'border-[#C5A059] bg-[#C5A059]/10 text-white shadow-sm'
                        : 'border-white/10 bg-[#07133B]/40 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[10px] text-[#C5A059] block">
                        {tab.number}
                      </span>
                      <span className="font-body text-xs font-medium">
                        {tab.label}
                      </span>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
                    )}
                  </button>
                )
              })}

              <div className="pt-6 border-t border-white/10 text-2xs font-body text-white/40 px-2 leading-relaxed">
                ¿Requieres asistencia técnica o radicar un peritaje? Escribe directamente a <a href="mailto:atencion@oasiscolchones.co" className="text-[#C5A059] underline">atencion@oasiscolchones.co</a>.
              </div>
            </div>

            {/* Document Body Content */}
            <div className="lg:col-span-8 border border-white/10 bg-[#07133B]/80 p-8 sm:p-12 space-y-8">
              
              {/* TAB 1: GARANTÍA INDUSTRIAL */}
              {activeTab === 'garantia' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo de Fábrica 01
                    </span>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                      Certificado de Garantía Industrial (10 a 15 Años)
                    </h2>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                      Vigencia aplicable a todas las referencias comercializadas directamente por Oasis Colchones S.A.S.
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        1.1. Alcance Técnico de la Cobertura
                      </h3>
                      <p>
                        Oasis Colchones S.A.S. garantiza la integridad estructural de cada colchón contra defectos de fabricación en su núcleo biomecánico durante el período especificado en la ficha del producto (10 años en referencias de espuma HR de alta densidad; 15 años en modelos híbridos con resortes pocket ensacados y látex Dunlop).
                      </p>
                      <ul className="mt-3 list-disc pl-5 space-y-1.5 text-white/70">
                        <li><strong>Deformación permanente no recuperable:</strong> Depresiones o hendiduras visibles en la superficie superiores a 2.5 cm (1 pulgada) sin peso aplicado sobre el colchón.</li>
                        <li><strong>Falla en la estructura de resortes:</strong> Rotura, fractura o pérdida de tensión elástica en las espirales de acero al carbono ensacadas.</li>
                        <li><strong>Fallas de confección estructural:</strong> Desprendimiento involuntario de ribetes perimetrales o separación de capas ensambladas por termofusión dentro de los primeros 3 años de uso ordinario.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        1.2. Exclusiones Explícitas (Cero Promesas Irreales)
                      </h3>
                      <p>
                        La garantía no cubre variaciones inherentes al desgaste natural o usos que contravengan las normas básicas de conservación:
                      </p>
                      <ul className="mt-3 list-disc pl-5 space-y-1.5 text-white/70">
                        <li>Ablandamiento natural de las espumas por adaptación al peso corporal inferior a 2.5 cm de deformación permanente.</li>
                        <li>Quemaduras, derrames de líquidos corporales, manchas de moho o humedad derivada de ventilación inadecuada del dormitorio.</li>
                        <li>Uso del colchón sobre bases de cama deformadas, somieres con tablones separados por más de 7 cm, o soportes que no cuenten con pata central de apoyo.</li>
                        <li>Preferencia subjetiva sobre grado de firmeza manifestada transcurridos los plazos de retracto legal.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        1.3. Procedimiento Oficial de Reclamación
                      </h3>
                      <p>
                        Para activar la garantía, el titular de la compra debe enviar a <span className="text-[#C5A059] font-mono">atencion@oasiscolchones.co</span> el número de cédula del comprador, fotografía de la etiqueta industrial cosida al colchón y registro fotográfico con una regla rígida apoyada horizontalmente sobre la depresión. Un ingeniero de planta revisará el caso y emitirá dictamen dentro de los 15 días hábiles conforme al Estatuto del Consumidor.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 2: ENVÍOS Y FLETES */}
              {activeTab === 'envios' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo de Fábrica 02
                    </span>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                      Política de Envíos, Despachos y Fletes
                    </h2>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                      Operación logística coordinada con flota directa y Coordinadora Mercantil.
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        2.1. Tiempos Reales de Entrega (Sin Promesas Ficticias)
                      </h3>
                      <p>
                        Cada colchón se confecciona o alista en nuestra planta de Bogotá tras la confirmación bancaria del pago. Los tiempos reales de despacho y tránsito terrestre son:
                      </p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-white/10 bg-[#0A1B54]/40 p-4">
                          <span className="font-mono text-xs text-[#C5A059] block">Zona 1: Bogotá & Sabana</span>
                          <p className="mt-1 font-display text-xl text-white">2 a 4 días hábiles</p>
                          <p className="mt-1 font-body text-2xs text-white/50">Flota propia directa de fábrica.</p>
                        </div>
                        <div className="border border-white/10 bg-[#0A1B54]/40 p-4">
                          <span className="font-mono text-xs text-[#C5A059] block">Zona 2: Ciudades Principales</span>
                          <p className="mt-1 font-display text-xl text-white">4 a 7 días hábiles</p>
                          <p className="mt-1 font-body text-2xs text-white/50">Medellín, Cali, Barranquilla, Bucaramanga.</p>
                        </div>
                        <div className="border border-white/10 bg-[#0A1B54]/40 p-4">
                          <span className="font-mono text-xs text-[#C5A059] block">Zona 3: Reexpedición Nacional</span>
                          <p className="mt-1 font-display text-xl text-white">8 a 12 días hábiles</p>
                          <p className="mt-1 font-body text-2xs text-white/50">Municipios intermedios y trayectos especiales.</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        2.2. Liquidación del Flete Asegurado
                      </h3>
                      <p>
                        El valor del flete se calcula en tiempo real durante el checkout de acuerdo con la matriz de peso volumétrico de Coordinadora Mercantil. El flete incluye seguro de carga contra siniestros, pérdidas o daños durante el transporte hasta la dirección indicada por el comprador.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        2.3. Protocolo de Recepción Física
                      </h3>
                      <p>
                        El cliente debe inspeccionar visualmente el embalaje termoplástico termosellado antes de firmar la guía de entrega. Si el empaque presenta perforaciones graves, agua o roturas que afecten la tela del colchón, debe anotarse en la guía física o digital del transportador y notificarse a Oasis dentro de las 24 horas siguientes.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 3: TÉRMINOS Y CONDICIONES */}
              {activeTab === 'terminos' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo de Fábrica 03
                    </span>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                      Términos y Condiciones Generales de Venta Directa
                    </h2>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                      Reglas contractuales que rigen la transacción electrónica entre el comprador y el fabricante.
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        3.1. Identificación y Perfeccionamiento del Contrato
                      </h3>
                      <p>
                        Las ventas celebradas a través de este portal son gestionadas exclusivamente por <strong>OASIS COLCHONES S.A.S.</strong>, sociedad comercial legalmente constituida bajo las leyes de la República de Colombia, identificada con NIT 901.482.391-4, con domicilio principal en Bogotá D.C. El contrato de compraventa se perfecciona en el momento en que la pasarela de pagos Wompi (Bancolombia) emite la confirmación de transacción aprobada.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        3.2. Precios, Facturación Electrónica DIAN e Impuestos
                      </h3>
                      <p>
                        Todos los precios exhibidos en el catálogo incluyen el Impuesto sobre las Ventas (IVA) a la tarifa general vigente en Colombia. Tras la aprobación de la transacción, se emite automáticamente la Factura Electrónica de Venta con validación previa de la DIAN y se remite al correo electrónico suministrado por el comprador.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        3.3. Seguridad en Pagos
                      </h3>
                      <p>
                        Oasis Colchones S.A.S. no almacena, captura ni procesa información de tarjetas de crédito o credenciales bancarias. Toda la recaudación se realiza a través de la infraestructura cifrada PCI-DSS de Wompi (Bancolombia) mediante tarjetas débito/crédito, PSE, Nequi y transferencias Bancolombia.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 4: RETRACTO Y DEVOLUCIONES */}
              {activeTab === 'retracto' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo de Fábrica 04
                    </span>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                      Derecho de Retracto (Artículo 47, Ley 1480 de 2011)
                    </h2>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                      Garantía legal para compras a distancia y comercio electrónico en Colombia.
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        4.1. Término Legal de Ejercicio
                      </h3>
                      <p>
                        El consumidor tiene derecho a ejercer el retracto de la compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de entrega física del colchón en su domicilio.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        4.2. Condición Sanitaria del Producto (Exigencia Legal de Ropa de Cama)
                      </h3>
                      <p>
                        De conformidad con las normas sanitarias y el numeral 4 del artículo 47 de la Ley 1480 de 2011, por tratarse de bienes de uso personal e íntimo (artículos de descanso y ropa de cama), <strong>el colchón debe devolverse sin haber sido usado, en su embalaje plástico termoplástico sellado de fábrica original, con todas sus etiquetas y accesorios intactos</strong>. No se aceptarán devoluciones por retracto de colchones desempacados o usados por estrictas razones de bioseguridad y salud pública.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        4.3. Costos de Transporte y Reembolso
                      </h3>
                      <p>
                        Los costos de flete terrestre asociados al retorno del producto a nuestra planta de Bogotá correrán por cuenta del consumidor, tal como estipula la ley colombiana. Una vez recibido el colchón en planta y verificado el precinto original, Oasis Colchones devolverá la totalidad del dinero pagado en un plazo no superior a treinta (30) días calendario.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 5: PRIVACIDAD Y DATOS */}
              {activeTab === 'privacidad' && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo de Fábrica 05
                    </span>
                    <h2 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-white">
                      Política de Protección de Datos Personales (Ley 1581 de 2012)
                    </h2>
                    <p className="mt-2 font-body text-xs sm:text-sm text-white/60">
                      Régimen de Habeas Data y tratamiento de información personal en Colombia.
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-white/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        5.1. Responsable del Tratamiento
                      </h3>
                      <p>
                        OASIS COLCHONES S.A.S., con domicilio en Bogotá D.C., es el Responsable del tratamiento de los datos personales recolectados a través de esta plataforma digital.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        5.2. Finalidades Estrictas de Recolección
                      </h3>
                      <p>
                        Los datos recopilados (nombre, documento de identidad, dirección física, teléfono y correo electrónico) son utilizados exclusivamente para:
                      </p>
                      <ul className="mt-3 list-disc pl-5 space-y-1 text-white/70">
                        <li>Procesamiento contable y emisión de factura electrónica DIAN.</li>
                        <li>Coordinación de despacho y entrega con los operadores logísticos autorizados.</li>
                        <li>Registro y seguimiento de la garantía industrial durante su período de vigencia (10 a 15 años).</li>
                        <li>Comunicaciones operativas relacionadas con el estado del pedido.</li>
                      </ul>
                      <p className="mt-3">
                        <strong>Cero comercialización de datos:</strong> Oasis Colchones S.A.S. no vende, alquila ni cede bases de datos personales a terceras empresas con fines comerciales o de telemercadeo.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-lg text-white mb-2">
                        5.3. Derechos ARCO y Canales de Atención
                      </h3>
                      <p>
                        El titular de los datos puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición remitiendo una solicitud escrita a <span className="text-[#C5A059] font-mono">atencion@oasiscolchones.co</span>. Las consultas serán resueltas en un término máximo de diez (10) días hábiles.
                      </p>
                    </section>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
