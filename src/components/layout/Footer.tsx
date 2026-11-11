import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[#0A1B54]/10 bg-white px-6 py-16 lg:px-16 text-[#0A1B54]">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Oasis Colchones y Muebles"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="font-display text-2xl font-normal text-[#0A1B54] leading-tight block">
                Oasis
              </span>
              <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[#C5A059] block font-medium">
                Colchones & Muebles
              </span>
            </div>
          </Link>
          <p className="font-body text-xs sm:text-sm text-[#0A1B54]/70 leading-relaxed max-w-sm">
            Manufactura de colchones ortopédicos, bases, almohadas viscoelásticas y lencería. Cero intermediarios comerciales y despacho nacional asegurado desde Bogotá, Colombia.
          </p>

          {/* Social Media Links */}
          <div className="pt-2">
            <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">
              Canales Oficiales y Redes
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://www.instagram.com/oasiscolchoness"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-3 py-1.5 font-body text-2xs text-[#0A1B54]/80 transition-all hover:border-[#0A1B54] hover:bg-[#0A1B54] hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/share/19irzQzouV/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-3 py-1.5 font-body text-2xs text-[#0A1B54]/80 transition-all hover:border-[#0A1B54] hover:bg-[#0A1B54] hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@oasiscolchoness"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-3 py-1.5 font-body text-2xs text-[#0A1B54]/80 transition-all hover:border-[#0A1B54] hover:bg-[#0A1B54] hover:text-white"
              >
                TikTok
              </a>
              <a
                href="http://wa.link/cfrej0"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0A1B54] bg-[#0A1B54] px-3 py-1.5 font-body text-2xs text-white transition-all hover:bg-[#C5A059] hover:border-[#C5A059]"
              >
                WhatsApp Oficial
              </a>
              <a
                href="https://share.google/YjMiZqeY6Ae0mzIg3"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0A1B54]/15 bg-[#0A1B54]/5 px-3 py-1.5 font-body text-2xs text-[#0A1B54]/80 transition-all hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
            Navegación
          </p>
          {[
            { href: '/', label: 'Inicio' },
            { href: '/catalogo', label: 'Catálogo de Productos' },
            { href: '/nosotros', label: 'Nosotros' },
            { href: '/checkout', label: 'Pasarela y Pago Seguro' },
            { href: '/legales', label: 'Términos y Marco Legal' },
          ].map(({ href, label }) => (
            <div key={href}>
              <Link
                href={href}
                className="font-body text-xs text-[#0A1B54]/70 transition-colors hover:text-[#C5A059]"
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* Direct Factory Attention */}
        <div className="space-y-3">
          <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
            Atención Directa y Sede
          </p>
          <p className="font-body text-xs text-[#0A1B54]/80">
            Carrera 5 #2-01, Local 11<br />
            Cota, Cundinamarca, Colombia
          </p>
          <p className="font-body text-xs text-[#0A1B54]/80 pt-1">
            <span className="text-[#0A1B54]/50 block text-[10px] uppercase tracking-wider">Horario de Atención:</span>
            Lunes a Viernes: 10:00 a. m. a 6:00 p. m.
          </p>
          <p className="font-body text-xs text-[#0A1B54]/80">
            <span className="text-[#0A1B54]/50 block text-[10px] uppercase tracking-wider">WhatsApp Oficial:</span>
            <a
              href="http://wa.link/cfrej0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A059] font-medium hover:underline"
            >
              +57 350 403 5144 (wa.link/cfrej0)
            </a>
          </p>
          <p className="font-body text-xs text-[#0A1B54]/80">
            <span className="text-[#0A1B54]/50 block text-[10px] uppercase tracking-wider">Sitio Web:</span>
            <span className="text-[#0A1B54]/70 font-mono text-2xs">
              www.oasiscolchonesymuebles.com
            </span>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[#0A1B54]/10 pt-8 sm:flex-row sm:items-center">
        <div>
          <p className="font-body text-xs text-[#0A1B54]/60">
            © {new Date().getFullYear()} Oasis Colchones y Muebles — NIT: 1011091483-4 (Titular: Luna Valentina Ramírez Vallejo). Bogotá, Colombia.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-2xs text-[#0A1B54]/50 font-body">
            <Link href="/legales?tab=terminos" className="hover:text-[#C5A059] transition-colors">
              Términos y Condiciones
            </Link>
            <span>•</span>
            <Link href="/legales?tab=datos" className="hover:text-[#C5A059] transition-colors">
              Tratamiento de Datos
            </Link>
            <span>•</span>
            <Link href="/legales?tab=privacidad" className="hover:text-[#C5A059] transition-colors">
              Privacidad
            </Link>
            <span>•</span>
            <Link href="/legales?tab=devolucion" className="hover:text-[#C5A059] transition-colors">
              Garantía y Devolución
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#0A1B54]/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Fábrica Operativa • Envíos a todo el país</span>
        </div>
      </div>
    </footer>
  )
}
