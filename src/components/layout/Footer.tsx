import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A1B54] px-6 py-16 lg:px-16">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-normal text-white leading-tight">
              Oasis Colchones
            </span>
          </Link>
          <p className="mt-4 font-body text-xs sm:text-sm text-white/50 leading-relaxed max-w-sm">
            Fábrica directa en Bogotá, Colombia. Veinte años de ingeniería biomecánica aplicada al descanso humano sin sobrecostos de intermediación.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
            <span className="font-body text-2xs uppercase tracking-widest text-[#C5A059]">
              13 Referencias Certificadas
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Navegación
          </p>
          {[
            { href: '/', label: 'Inicio' },
            { href: '/catalogo', label: 'Catálogo de Colchones' },
            { href: '/fabrica', label: 'Nuestra Fábrica' },
            { href: '/checkout', label: 'Pasarela y Pago Seguro' },
          ].map(({ href, label }) => (
            <div key={href}>
              <Link
                href={href}
                className="font-body text-xs text-white/60 transition-colors hover:text-[#C5A059]"
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Atención Directa Fábrica
          </p>
          <p className="font-body text-xs text-white/60">
            Zona Industrial — Bogotá D.C., Colombia
          </p>
          <p className="font-body text-xs text-white/60">
            contacto@oasiscolchones.co
          </p>
          <p className="font-body text-xs text-white/60">
            Línea directa: +57 (601) 345-6789
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
        <p className="font-body text-xs text-white/40">
          © {new Date().getFullYear()} Oasis Colchones SAS. Hecho en Colombia.
        </p>
        <div className="flex items-center gap-4">
          <span className="font-body text-2xs uppercase tracking-wider text-white/40">
            Pagos seguros con
          </span>
          {/* Authentic Wompi & Bancolombia micro badges */}
          <div className="flex items-center gap-3 opacity-70">
            <span className="font-mono text-2xs font-bold text-[#00C3A5]">wompi</span>
            <span className="text-white/20">|</span>
            <span className="font-sans text-2xs font-bold text-[#FDDA24]">Bancolombia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
