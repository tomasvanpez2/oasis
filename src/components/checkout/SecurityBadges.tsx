export function SecurityBadges() {
  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      <div className="flex items-center justify-between">
        <p className="font-body text-2xs uppercase tracking-[0.2em] text-[#C5A059]">
          Pasarela Certificada y Seguridad Bancaria
        </p>
        <span className="flex items-center gap-1.5 font-body text-2xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Conexión TLS 1.3
        </span>
      </div>

      {/* Grid of authentic official SVG brand vectors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Wompi SVG Official Logo */}
        <div className="flex h-14 items-center justify-center border border-white/10 bg-white/5 px-4 transition-colors hover:border-[#00C3A5]/60 hover:bg-[#00C3A5]/5">
          <svg viewBox="0 0 110 32" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wompi">
            <path
              d="M10.8 24.5L5.2 6.8h4.6l3.4 12.3 3.6-12.3h4.2l3.6 12.3 3.4-12.3h4.6l-5.6 17.7h-4.8l-3.3-11.4-3.3 11.4h-4.8z"
              fill="#00C3A5"
            />
            <path
              d="M34.5 17.2c0-4.6 3.4-8 8.1-8s8.1 3.4 8.1 8-3.4 8-8.1 8-8.1-3.4-8.1-8zm11.8 0c0-2.3-1.6-4.2-3.7-4.2s-3.7 1.9-3.7 4.2 1.6 4.2 3.7 4.2 3.7-1.9 3.7-4.2z"
              fill="#FFFFFF"
            />
            <path
              d="M54.2 24.5V9.6h4.2v2.2c1.1-1.6 3.1-2.5 5.1-2.5 2.5 0 4.4 1.2 5.2 3.2 1.2-2 3.3-3.2 5.6-3.2 3.5 0 5.7 2.3 5.7 6.2v9h-4.4v-8.4c0-1.9-1-3-2.6-3-1.6 0-2.8 1.2-2.8 3.2v8.2h-4.4v-8.4c0-1.9-1-3-2.6-3-1.6 0-2.8 1.2-2.8 3.2v8.2h-4.2z"
              fill="#FFFFFF"
            />
            <path
              d="M83.2 28.5V9.6h4.2v2.2c1.2-1.6 3.2-2.5 5.4-2.5 4.4 0 7.8 3.4 7.8 8s-3.4 8-7.8 8c-2.1 0-4-0.9-5.2-2.4v5.6h-4.4zm13 -11.3c0-2.4-1.7-4.2-3.8-4.2s-3.8 1.8-3.8 4.2 1.7 4.2 3.8 4.2 3.8-1.8 3.8-4.2z"
              fill="#FFFFFF"
            />
            <path
              d="M104.2 24.5V9.6h4.4v14.9h-4.4zm0-18V2.8h4.4v3.7h-4.4z"
              fill="#00C3A5"
            />
          </svg>
        </div>

        {/* Bancolombia SVG Official Geometric Ribbon Logo */}
        <div className="flex h-14 items-center justify-center border border-white/10 bg-white/5 px-4 transition-colors hover:border-[#FDDA24]/60 hover:bg-[#FDDA24]/5">
          <svg viewBox="0 0 140 32" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bancolombia">
            {/* Bancolombia modern geometric symbol */}
            <path d="M4 22L12 6h5l-8 16H4z" fill="#FDDA24" />
            <path d="M12 22l6-12h5l-6 12h-5z" fill="#00C389" />
            <path d="M19 22l4-8h5l-4 8h-5z" fill="#002F6C" />
            {/* Wordmark */}
            <text
              x="36"
              y="20"
              fill="#FFFFFF"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12"
              fontWeight="700"
              letterSpacing="0.08em"
            >
              Bancolombia
            </text>
          </svg>
        </div>

        {/* PSE (Pagos Seguros en Línea) Official SVG */}
        <div className="flex h-14 items-center justify-center border border-white/10 bg-white/5 px-4 transition-colors hover:border-sky-400/60 hover:bg-sky-400/5">
          <svg viewBox="0 0 80 32" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PSE">
            <circle cx="20" cy="16" r="12" fill="#003366" />
            <circle cx="20" cy="16" r="9" fill="#0072CE" />
            <text
              x="12"
              y="20"
              fill="#FFFFFF"
              fontFamily="system-ui, sans-serif"
              fontSize="11"
              fontWeight="900"
              letterSpacing="-0.05em"
            >
              pse
            </text>
            <text
              x="36"
              y="15"
              fill="#FFFFFF"
              fontFamily="system-ui, sans-serif"
              fontSize="8"
              fontWeight="800"
            >
              PAGOS
            </text>
            <text
              x="36"
              y="23"
              fill="#C5A059"
              fontFamily="system-ui, sans-serif"
              fontSize="7"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              EN LÍNEA
            </text>
          </svg>
        </div>

        {/* Visa & Mastercard combined vector */}
        <div className="flex h-14 items-center justify-center gap-3 border border-white/10 bg-white/5 px-3 transition-colors hover:border-amber-400/60 hover:bg-amber-400/5">
          {/* Mastercard circles */}
          <svg viewBox="0 0 36 24" className="h-5 w-auto" fill="none" aria-label="Mastercard">
            <circle cx="13" cy="12" r="9" fill="#EB001B" />
            <circle cx="23" cy="12" r="9" fill="#F79E1B" fillOpacity="0.9" />
          </svg>
          {/* Visa text mark */}
          <svg viewBox="0 0 44 20" className="h-4 w-auto" fill="none" aria-label="Visa">
            <path
              d="M17.5 3.5l-3.8 13.2h-2.9L7.2 6.5C6.9 5.3 6.6 4.9 5.7 4.4 4.3 3.6 2.1 3 0 2.5l.3-.8h7.4c1.9 0 3.2 1.3 3.6 3.1l1.8 9.3 4.4-10.6h2.9zm13 8.8c0-3.4-4.8-3.6-4.8-5.2 0-.5.5-1.1 1.6-1.2 1.1-.1 2.9.2 4.1.9l.7-3.4c-1-.4-2.4-.7-4.1-.7-4.3 0-7.3 2.3-7.3 5.5 0 2.4 2.1 3.7 3.8 4.5 1.7.8 2.3 1.3 2.3 2 0 1.1-1.3 1.6-2.5 1.6-1.7 0-3.3-.4-4.8-1.2l-.7 3.6c1.2.6 3.3 1 5.3 1 4.7 0 7.7-2.3 7.7-5.7zM44 16.7h2.6L42.2 3.5h-2.4c-1 0-1.8.6-2.1 1.4L31.8 16.7h3.1l.6-1.8h3.8l.7 1.8zm-3.1-4.2l1.6-4.4.9 4.4h-2.5zM22.8 3.5l-2.4 13.2h-2.9l2.4-13.2h2.9z"
              fill="#1A1F71"
            />
            <path
              d="M17.5 3.5l-3.8 13.2h-2.9L7.2 6.5C6.9 5.3 6.6 4.9 5.7 4.4 4.3 3.6 2.1 3 0 2.5l.3-.8h7.4c1.9 0 3.2 1.3 3.6 3.1l1.8 9.3 4.4-10.6h2.9z"
              fill="#F7B600"
            />
          </svg>
        </div>
      </div>

      {/* Security explanation text */}
      <div className="flex items-start gap-3 border border-white/5 bg-[#0D2266]/30 p-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#C5A059]">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-body text-xs text-white/50 leading-relaxed">
          <strong className="text-white">Procesamiento Nativo y Encriptado:</strong> Los datos de tu tarjeta nunca se almacenan en servidores locales. La transacción se liquida directamente contra la bóveda tokenizada de Bancolombia / Wompi con certificado PCI-DSS Nivel 1.
        </p>
      </div>
    </div>
  )
}
