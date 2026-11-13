'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { TextSplitReveal } from '@/components/ui/TextSplitReveal'

type LegalTab = 'terminos' | 'datos' | 'privacidad' | 'fraude' | 'garantia'

function LegalesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as LegalTab | null

  const [activeTab, setActiveTab] = useState<LegalTab>('terminos')

  useEffect(() => {
    if (tabParam && ['terminos', 'datos', 'privacidad', 'fraude', 'garantia'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const TABS: { id: LegalTab; label: string; number: string }[] = [
    {
      id: 'terminos',
      label: 'Términos y Condiciones Generales',
      number: '01',
    },
    {
      id: 'datos',
      label: 'Tratamiento de Datos Personales (Ley 1581)',
      number: '02',
    },
    {
      id: 'privacidad',
      label: 'Política de Privacidad & Cookies',
      number: '03',
    },
    {
      id: 'fraude',
      label: 'Prevención de Fraude & Devolución',
      number: '04',
    },
    {
      id: 'garantia',
      label: 'Garantía Industrial & Ficha Técnica',
      number: '05',
    },
  ]

  return (
    <main className="bg-white min-h-screen text-[#0A1B54]">
      <Header />

      <section className="relative pt-36 pb-24 lg:pt-44 lg:pb-36 px-6 lg:px-16 overflow-hidden">
        {/* Subtle architectural grid lines */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-4 opacity-5">
          <div className="border-r border-[#0A1B54]" />
          <div className="border-r border-[#0A1B54]" />
          <div className="border-r border-[#0A1B54]" />
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
                text="Documentación Legal Oficial."
                as="h1"
                className="font-display text-4xl sm:text-6xl lg:text-7xl font-normal text-[#0A1B54] leading-tight"
                delay={0.1}
                stagger={0.06}
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 font-body text-sm sm:text-base text-[#0A1B54]/70 max-w-2xl leading-relaxed"
            >
              Documentación legal completa de Oasis Colchones y Muebles conforme al Estatuto del Consumidor en Colombia (Ley 1480 de 2011), la Ley de Habeas Data (Ley 1581 de 2012) y los lineamientos de la Superintendencia de Industria y Comercio.
            </motion.p>
          </div>

          {/* Legal Identification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 border border-[#0A1B54]/10 bg-[#FAF9F7] p-6 sm:p-8 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div>
              <p className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                Razón Social:
              </p>
              <p className="mt-1 font-body text-sm text-[#0A1B54] font-medium">
                Oasis Colchones y Muebles
              </p>
              <p className="font-body text-xs text-[#0A1B54]/60">
                Línea Oficial de Descanso
              </p>
            </div>
            <div className="sm:border-l sm:border-[#0A1B54]/10 sm:pl-6">
              <p className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                NIT:
              </p>
              <p className="mt-1 font-mono text-sm text-[#0A1B54] font-medium">
                1011091483-4
              </p>
              <p className="font-body text-xs text-[#0A1B54]/60">
                Registro Tributario DIAN
              </p>
            </div>
            <div className="lg:border-l lg:border-[#0A1B54]/10 lg:pl-6">
              <p className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                Dirección:
              </p>
              <p className="mt-1 font-body text-sm text-[#0A1B54]">
                Carrera 5 #2-01, Local 11
              </p>
              <p className="font-body text-xs text-[#0A1B54]/60">
                Cota, Cundinamarca, Colombia
              </p>
            </div>
            <div className="lg:border-l lg:border-[#0A1B54]/10 lg:pl-6">
              <p className="font-mono text-2xs uppercase tracking-wider text-[#C5A059]">
                Teléfono:
              </p>
              <a
                href="http://wa.link/cfrej0"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 font-mono text-sm text-[#0A1B54] hover:underline block font-semibold text-[#0A1B54]"
              >
                350 403 5144
              </a>
              <p className="font-body text-xs text-[#0A1B54]/60">
                Lunes a Viernes: 10am – 6pm
              </p>
            </div>
          </motion.div>

          {/* Master Grid with Navigation Sidebar & Document Reader */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 sticky top-28 space-y-2">
              <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059] block mb-3 px-2">
                Índice de Documentos Legales
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
                        ? 'border-[#0A1B54] bg-[#C5A059]/15 text-[#0A1B54] '
                        : 'border-[#0A1B54]/10 bg-[#FAF9F7] text-[#0A1B54]/70 hover:border-[#0A1B54]/30 hover:text-[#0A1B54]'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-2xs text-[#C5A059] block">
                        {tab.number}
                      </span>
                      <span className="font-body text-xs font-medium">
                        {tab.label}
                      </span>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#0A1B54] " />
                    )}
                  </button>
                )
              })}

            </div>

            {/* Document Body Content */}
            <div className="lg:col-span-8 border border-[#0A1B54]/10 bg-[#FAF9F7] p-8 sm:p-12 space-y-8 backdrop-blur-md">
              
              {/* TAB 1: TÉRMINOS Y CONDICIONES */}
              {activeTab === 'terminos' && (
                <div className="space-y-6">
                  <div className="border-b border-[#0A1B54]/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Marco Regulatorio 01
                    </span>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      Términos y Condiciones Generales de Compra y Uso
                    </h2>
                    <p className="mt-1 font-body text-xs text-[#0A1B54]/60">
                      Vigentes desde el 4 de noviembre de 2026 • www.oasiscolchonesymuebles.com
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        1. Quiénes somos
                      </h3>
                      <p>
                        El sitio <strong>www.oasiscolchonesymuebles.com</strong> (el “Sitio”) es operado por la razón social <strong>Oasis Colchones y Muebles</strong>, con NIT <strong>1011091483-4</strong>, con domicilio en Carrera 5 #2-01, Local 11, Cota, Cundinamarca, Colombia. Canal de atención y teléfono: <strong>350 403 5144</strong>, de lunes a viernes, de 10:00 a. m. a 6:00 p. m.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        2. Aceptación y Capacidad Legal
                      </h3>
                      <p>
                        Al navegar en el Sitio, consultar el catálogo, registrar datos o realizar compras, usted acepta expresamente estos Términos y condiciones. Si no está de acuerdo, le solicitamos abstenerse de utilizar el Sitio. Las compras están destinadas a personas mayores de edad con capacidad legal para contratar bajo el Código de Comercio colombiano.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        3. Productos, Medidas y Precios
                      </h3>
                      <p>
                        Comercializamos colchones, bases cama, almohadas y lencería para el descanso. Las medidas se expresan en centímetros (ej. 90x190, 100x190, 120x190, 140x190, 160x190, 200x200 cm) con tolerancia industrial estándar de ±2 cm de confección. Los precios se informan en pesos colombianos (COP), son válidos al momento de confirmar el pedido y pueden ajustarse sin previo aviso para pedidos futuros.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        4. Medios de Pago Autorizados
                      </h3>
                      <p>
                        Los pagos se procesan de manera segura a través de la pasarela <strong>Wompi</strong> (Bancolombia, tarjetas débito, crédito, PSE y Nequi), financiamiento con <strong>Addi</strong> y <strong>Sistecrédito</strong>, transferencias a cuentas oficiales de la empresa, o modalidad contraentrega en zonas con cobertura. Oasis nunca solicitará contraseñas bancarias ni números completos de tarjeta por chat o llamada.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        5. Entregas, Cobertura y Despacho
                      </h3>
                      <p>
                        Entregamos en Bogotá D.C. (20 localidades) y municipios de la Sabana (Cota, Chía, Cajicá) mediante cuadrilla técnica directa y flota de Transporte Propio. La entrega se efectúa en la dirección indicada hasta la puerta del inmueble o portería. El cliente debe verificar que las dimensiones de puertas, pasillos y escaleras permitan el ingreso seguro del producto.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        6. Derecho de Retracto (Ley 1480 de 2011, Art. 47)
                      </h3>
                      <p>
                        Para compras no presenciales en el Sitio, usted tiene derecho a retractarse dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la entrega del producto. El producto debe devolverse nuevo, sin uso, en su empaque original plástico sellado, sin manchas ni olores y con todos sus accesorios. El costo del flete de devolución corre por cuenta del comprador según la ley.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        7. Garantía Legal
                      </h3>
                      <p>
                        Nuestros colchones y bases cuentan con garantía industrial contra defectos de fabricación en resortes, estructuras de madera y núcleos de espuma según la referencia (de 1 a 8 años, de acuerdo con la ficha técnica oficial de fábrica). La garantía no cubre desgaste natural por uso, manchas por derrames o manipulación indebida.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 2: TRATAMIENTO DE DATOS PERSONALES (HABEAS DATA) */}
              {activeTab === 'datos' && (
                <div className="space-y-6">
                  <div className="border-b border-[#0A1B54]/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Marco Regulatorio 02
                    </span>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      Política de Tratamiento de Datos Personales (Ley 1581 de 2012)
                    </h2>
                    <p className="mt-1 font-body text-xs text-[#0A1B54]/60">
                      Habeas Data • Vigente desde el 4 de noviembre de 2026
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        1. Responsable del Tratamiento
                      </h3>
                      <p>
                        Razón social: <strong>Oasis Colchones y Muebles</strong>, NIT <strong>1011091483-4</strong>. Domicilio: Carrera 5 #2-01, Local 11, Cota, Cundinamarca, Colombia. Teléfono y WhatsApp oficial: <strong>350 403 5144</strong>. Sitio web: www.oasiscolchonesymuebles.com.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        2. Marco Legal
                      </h3>
                      <p>
                        Artículo 15 de la Constitución Política de Colombia, <strong>Ley Estatutaria 1581 de 2012</strong>, Decreto Único Reglamentario 1074 de 2015 y normas concordantes de la Superintendencia de Industria y Comercio (SIC).
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        3. Finalidades del Tratamiento
                      </h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-[#0A1B54]/70">
                        <li>Procesar, confirmar, facturar y despachar sus pedidos de colchones y muebles.</li>
                        <li>Coordinar las entregas domiciliarias y contactarle vía telefónica o WhatsApp para notificar el estado del envío.</li>
                        <li>Gestionar garantías, solicitudes de servicio posventa y peticiones, quejas y reclamos (PQR).</li>
                        <li>Cumplir con las obligaciones fiscales, contables y de facturación electrónica ante la DIAN.</li>
                        <li>Con su autorización previa y expresa, enviar información comercial sobre promociones y novedades.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        4. Derechos del Titular de los Datos
                      </h3>
                      <p>
                        Conforme al artículo 8 de la Ley 1581 de 2012, usted tiene derecho a:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-[#0A1B54]/70 mt-2">
                        <li><strong>Conocer, actualizar y rectificar</strong> sus datos personales frente a Oasis Colchones y Muebles.</li>
                        <li><strong>Solicitar prueba</strong> de la autorización otorgada para el tratamiento.</li>
                        <li><strong>Revocar la autorización</strong> y/o solicitar la supresión de sus datos cuando no medie un deber legal o contractual de conservarlos.</li>
                        <li><strong>Acceder en forma gratuita</strong> a sus datos personales que hayan sido objeto de tratamiento.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        5. Canales para Ejercer sus Derechos
                      </h3>
                      <p>
                        Puede radicar sus consultas o reclamos de Habeas Data enviando una comunicación al WhatsApp oficial <strong>350 403 5144</strong> o a la Carrera 5 #2-01, Local 11, Cota, Cundinamarca, indicando su nombre completo, número de documento y la descripción clara de su solicitud. Su solicitud será resuelta dentro de los 10 o 15 días hábiles conforme a la ley.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 3: POLÍTICA DE PRIVACIDAD & COOKIES */}
              {activeTab === 'privacidad' && (
                <div className="space-y-6">
                  <div className="border-b border-[#0A1B54]/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Marco Regulatorio 03
                    </span>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      Política de Privacidad y Manejo de Cookies
                    </h2>
                    <p className="mt-1 font-body text-xs text-[#0A1B54]/60">
                      Transparencia digital • Vigente desde el 4 de noviembre de 2026
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        1. Información Recopilada
                      </h3>
                      <p>
                        Recopilamos únicamente la información necesaria para brindarle una experiencia fluida y concretar sus compras: nombre, cédula o NIT para factura electrónica, número de celular, dirección y ciudad de entrega, y correo electrónico para envío de la confirmación.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        2. Terceros Aliados de Confianza
                      </h3>
                      <p>
                        Solo compartimos los datos estrictamente necesarios con aliados operativos indispensables:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-[#0A1B54]/70 mt-2">
                        <li><strong>Pasarelas de Pago:</strong> Wompi (Bancolombia), Addi y Sistecrédito. Sus datos financieros viajan encriptados y Oasis nunca tiene acceso ni custodia de números de tarjeta de crédito.</li>
                        <li><strong>Empresas de Transporte:</strong> Para coordinar el envío de su pedido hasta la puerta de su domicilio.</li>
                        <li><strong>Autoridades Tributarias:</strong> DIAN para cumplimiento de obligaciones de facturación electrónica.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        3. Uso de Cookies
                      </h3>
                      <p>
                        Utilizamos cookies técnicas necesarias para el funcionamiento del carrito de compras y la seguridad de la sesión. Opcionalmente, cookies analíticas de Google Analytics para conocer patrones agregados de visita que nos permitan optimizar el rendimiento del sitio.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 4: PREVENCIÓN DE FRAUDE Y DEVOLUCIÓN */}
              {activeTab === 'fraude' && (
                <div className="space-y-6">
                  <div className="border-b border-[#0A1B54]/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Marco Regulatorio 04
                    </span>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      Política de Prevención de Fraude y Devolución de Dinero
                    </h2>
                    <p className="mt-1 font-body text-xs text-[#0A1B54]/60">
                      Seguridad en transacciones • Vigente desde el 4 de noviembre de 2026
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        1. Pagos Seguros y Verificación
                      </h3>
                      <p>
                        Todos los pagos con tarjeta o PSE en el Sitio se procesan a través de la infraestructura segura de <strong>Wompi</strong> con cifrado TLS/SSL de 256 bits y protocolos 3D Secure. Oasis solo recibe pagos por los canales oficiales autorizados. Cualquier solicitud de pago a cuentas no oficiales carece de validez.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        2. Cuándo Procede la Devolución de Dinero
                      </h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-[#0A1B54]/70">
                        <li><strong>Falta de Disponibilidad:</strong> Cuando el producto adquirido no esté disponible y el cliente no acepte un cambio de referencia.</li>
                        <li><strong>Cancelación por Oasis:</strong> Por imposibilidad logística de entrega en la zona de destino.</li>
                        <li><strong>Ejercicio Oportuno del Derecho de Retracto:</strong> Notificado formalmente dentro de los 5 días hábiles siguientes a la entrega, con el producto en perfecto estado y empaque sellado.</li>
                        <li><strong>Reversión del Pago (Decreto 587 de 2016):</strong> En casos de fraude comprobado, operación no solicitada o producto recibido defectuoso.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        3. Plazos y Modalidades de Reembolso
                      </h3>
                      <p>
                        Las devoluciones aprobadas se tramitan en un plazo máximo de <strong>quince (15) a treinta (30) días calendario</strong> a través del mismo medio de pago empleado por el cliente (reversión a tarjeta de crédito o débito vía Wompi) o mediante transferencia bancaria a la cuenta certificada a nombre del titular de la compra.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* TAB 5: GARANTÍA INDUSTRIAL & FICHA TÉCNICA */}
              {activeTab === 'garantia' && (
                <div className="space-y-6">
                  <div className="border-b border-[#0A1B54]/10 pb-6">
                    <span className="font-mono text-2xs uppercase tracking-widest text-[#C5A059]">
                      Protocolo Técnico 05
                    </span>
                    <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-[#0A1B54]">
                      Garantía Industrial de Fábrica & Ficha Técnica Oficial
                    </h2>
                    <p className="mt-1 font-body text-xs text-[#0A1B54]/60">
                      Resortes Bonell, Pocket y Núcleos de Espuma D120/D26 • Garantía Directa de Fábrica (1 a 8 Años)
                    </p>
                  </div>

                  <div className="space-y-6 font-body text-xs sm:text-sm text-[#0A1B54]/80 leading-relaxed">
                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        1. Cobertura Estructural de Manufactura
                      </h3>
                      <p>
                        Oasis Colchones y Muebles garantiza la resistencia y durabilidad de los resortes en acero de alto carbono (Bonell de 5 vueltas y Pocket ensacados independientes) y la densidad de sus espumas ortopédicas (Cazata D120, Espuma Rosada D26 y Espuma Penta D26) de acuerdo con los años especificados en la ficha técnica de cada producto.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-display text-base sm:text-lg text-[#0A1B54] mb-2 text-[#C5A059]">
                        2. Tabla de Referencias y Especificaciones Oficiales
                      </h3>
                      <div className="mt-3 overflow-x-auto border border-[#0A1B54]/10">
                        <table className="w-full text-left font-body text-xs">
                          <thead className="bg-white border-b border-[#0A1B54]/10 text-[#0A1B54]/60 uppercase font-mono text-[10px]">
                            <tr>
                              <th className="p-3">Línea / Modelo</th>
                              <th className="p-3">Núcleo Oficial</th>
                              <th className="p-3">Altura</th>
                              <th className="p-3">Gráfica Firmeza</th>
                              <th className="p-3">Garantía</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[#0A1B54]/80">
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Pillow Top Pocket</td>
                              <td className="p-3">Resortes Pocket con Marco de Acero + Algodón Laminado + Politex + D26 + Cazata D120 + Penta D26</td>
                              <td className="p-3 font-mono">42 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.10</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">8 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Pillow Top Encapsulado</td>
                              <td className="p-3">Panel Bonell 5v + Politubos de Yumbolón + Algodón Laminado + Politex + D26 + Cazata D120 + Rosada D26</td>
                              <td className="p-3 font-mono">35 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.9</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">8 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Pillow Top Original</td>
                              <td className="p-3">Panel Bonell 5v (Sin Politubos) + Algodón Laminado + Politex + Rosada D26 + Cazata D120 + Penta D26</td>
                              <td className="p-3 font-mono">35 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.8</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">6 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Imitación Pillow Antiescaras</td>
                              <td className="p-3">Panel Bonell 5v + Algodón Laminado + Cazata D120 + Espuma Rosada Troquelada D26</td>
                              <td className="p-3 font-mono">32 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.7</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">6 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Imitación Pillow Penta</td>
                              <td className="p-3">Panel Bonell 5v + Algodón Laminado + Cazata D120 + Espuma Penta D26</td>
                              <td className="p-3 font-mono">32 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.6</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">6 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Ortopédico Clínico</td>
                              <td className="p-3">Lámina Cazata D120 (10 cm) + 2 Láminas Espuma Rosada D26 (5 cm c/u)</td>
                              <td className="p-3 font-mono">24 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.5</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">5 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Ortopédico Resortado</td>
                              <td className="p-3">Panel Bonell 5v + 2 Láminas Algodón Laminado + 2 Láminas Cazata D120 (sin D26)</td>
                              <td className="p-3 font-mono">25 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.4</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">6 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Semi-Ortopédico Resortado</td>
                              <td className="p-3">Panel Bonell 5v + 2 Láminas Algodón Laminado + 2 Láminas Espuma Rosada D26</td>
                              <td className="p-3 font-mono">25 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.3</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">4 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchón Semi-Anatómico de Espuma Rosada D26</td>
                              <td className="p-3">Una lámina Espuma Rosada D26 (10 cm) + Una lámina Cazata D120 (2.8 cm)</td>
                              <td className="p-3 font-mono">17 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.2</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">2 Años</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium text-[#0A1B54]">Colchoneta de Espuma Rosada D26</td>
                              <td className="p-3">Una lámina Espuma Rosada D26 (10 cm)</td>
                              <td className="p-3 font-mono">12 cm</td>
                              <td className="p-3 text-[#C5A059]">Ficha Técnica p.1</td>
                              <td className="p-3 font-mono font-bold text-[#0A1B54]">1 Año</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
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

export default function LegalesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LegalesContent />
    </Suspense>
  )
}
