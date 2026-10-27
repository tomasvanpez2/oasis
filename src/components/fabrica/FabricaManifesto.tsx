'use client'
import { motion } from 'framer-motion'

const MANIFESTO_LINES = [
  'Fabricamos porque creemos que el precio justo',
  'solo existe cuando eliminamos al intermediario.',
  'No tenemos sala de exhibición.',
  'Nuestro showroom es este sitio.',
  'Nuestra garantía es la ingeniería visible.',
]

export function FabricaManifesto() {
  return (
    <section className="border-t border-white/10 px-8 py-24 lg:px-16 lg:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Left: manifesto text */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]"
          >
            Manifiesto
          </motion.p>

          <div className="mt-8 space-y-0">
            {MANIFESTO_LINES.map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.p
                  className="font-display text-2xl font-normal italic text-white leading-snug md:text-3xl"
                  initial={{ y: '100%' }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: certifications and values */}
        <div className="space-y-8 lg:pl-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]"
          >
            Compromisos
          </motion.p>

          {[
            {
              title: 'Materiales con trazabilidad',
              body: 'Cada insumo tiene ficha técnica disponible para el comprador. Espuma, látex, acero: todo verificable.',
            },
            {
              title: 'Precio sin inflación de canal',
              body: 'El precio que ves es el precio de fábrica más nuestro margen directo. Sin comisiones ocultas.',
            },
            {
              title: 'Garantía de manufactura',
              body: 'Respaldamos cada colchón por defectos de fabricación. No de desgaste natural.',
            },
            {
              title: 'Entrega con protocolo',
              body: 'Transportamos en vehículo propio con personal capacitado. Ningún tercero maneja tu pedido.',
            },
          ].map(({ title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="border-t border-white/10 pt-6"
            >
              <h3 className="font-display text-lg font-normal text-white">{title}</h3>
              <p className="mt-2 font-body text-sm text-white/50 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
