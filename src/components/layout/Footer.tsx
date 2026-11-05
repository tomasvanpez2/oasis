import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07133B] px-6 py-16 lg:px-16">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-normal text-white leading-tight">
              Oasis Colchones
            </span>
          </Link>
          <p className="mt-4 font-body text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm">
            Manufactura directa en Bogotá, Colombia. Más de veinte años de ingeniería biomecánica aplicada al descanso humano, sin intermediación de centros comerciales ni sobrecostos de retail.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
              <span className="font-body text-2xs uppercase tracking-widest text-[#C5A059]">
                13 Referencias Certificadas
              </span>
            </div>
            <span className="text-white/20">•</span>
            <span className="font-body text-2xs uppercase tracking-widest text-white/40">
              Garantía de 10 a 15 Años
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Navegación
          </p>
          {[
            { href: '/', label: 'Inicio' },
            { href: '/catalogo', label: 'Catálogo de Colchones' },
            { href: '/filosofia', label: 'Filosofía' },
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

        {/* Direct Factory Attention */}
        <div className="space-y-3">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
            Atención Directa Fábrica
          </p>
          <p className="font-body text-xs text-white/70">
            Cra. 68D #17-25, Parque Industrial Montevideo / Fontibón<br />
            Bogotá D.C., Colombia
          </p>
          <p className="font-body text-xs text-white/80 pt-1">
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">PBX Planta:</span>
            <a href="tel:+576017452890" className="hover:text-[#C5A059] transition-colors">
              +57 (601) 745 2890
            </a>
          </p>
          <p className="font-body text-xs text-white/80">
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">WhatsApp Oficial:</span>
            <a
              href="https://wa.me/573108529410"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A059] hover:underline"
            >
              +57 310 852 9410
            </a>
          </p>
          <p className="font-body text-xs text-white/80">
            <span className="text-white/40 block text-[10px] uppercase tracking-wider">Correo de Soporte:</span>
            <a href="mailto:atencion@oasiscolchones.co" className="hover:text-[#C5A059] transition-colors">
              atencion@oasiscolchones.co
            </a>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-body text-xs text-white/50">
            © {new Date().getFullYear()} Oasis Colchones S.A.S. — NIT: 901.482.391-4. Bogotá D.C., Colombia.
          </p>
          <div className="mt-1 flex items-center gap-3 text-2xs text-white/40 font-body">
            <Link href="/legales" className="hover:text-[#C5A059] transition-colors">
              Garantía Industrial
            </Link>
            <span>•</span>
            <Link href="/legales" className="hover:text-[#C5A059] transition-colors">
              Política de Envíos Coordinadora
            </Link>
            <span>•</span>
            <Link href="/legales" className="hover:text-[#C5A059] transition-colors">
              Habeas Data Ley 1581
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-body text-2xs uppercase tracking-wider text-white/40">
            Pagos seguros con
          </span>
          <div className="flex items-center gap-3 opacity-80">
            <span className="font-mono text-2xs font-bold text-[#00C3A5]">wompi</span>
            <span className="text-white/20">|</span>
            <span className="font-sans text-2xs font-bold text-[#FDDA24]">Bancolombia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
