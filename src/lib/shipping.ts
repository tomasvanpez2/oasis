/**
 * Oasis Colchones — Matriz Logística de Despachos Coordinadora Mercantil
 * Origen Oficial: Bodega Central de Confección — Barrio Normandía, Bogotá D.C.
 * 
 * Tarifas oficiales de carga pesada / volumétrica para colchones individuales y dobles.
 * Motor de resolución y cruce determinístico Zero-Trust de tarifas de flete.
 */

export interface ShippingZone {
  id: string
  name: string
  group: 'Bogotá Urbana' | 'Cundinamarca & Cercanías' | 'Regiones Principales' | 'Cobertura Nacional & Periferia'
  price: number // COP
  estimatedDays: string
  coverage: string
}

export interface ShippingResolution {
  zone: ShippingZone
  matchedBy: 'specific_city' | 'regional_zone' | 'national_fallback' | 'default_origin'
  matchedTerm?: string
  confidence: 'exact' | 'high' | 'fallback' | 'default_origin'
  displayText: string
  isCovered: boolean
  warning?: string
  normalizedInput: string
}

export const COORDINADORA_ORIGIN = {
  city: 'Bogotá, D.C.',
  neighborhood: 'Normandía (Engativá)',
  postalCode: '111071',
  facility: 'Planta de Producción Oasis Colchones',
}

/**
 * 15 Zonas Oficiales de Coordinadora desde bodega Normandía
 */
export const SHIPPING_ZONES: readonly ShippingZone[] = [
  // ── 1. BOGOTÁ (3 ZONAS) ───────────────────────────────────────────────────
  {
    id: 'bogota-centro-occidente',
    name: 'Bogotá (Centro / Occidente)',
    group: 'Bogotá Urbana',
    price: 35000,
    estimatedDays: '24 horas',
    coverage: 'Normandía, Fontibón, Engativá, Salitre, Teusaquillo, Chapinero, Barrios Unidos, Kennedy',
  },
  {
    id: 'bogota-norte',
    name: 'Bogotá (Norte)',
    group: 'Bogotá Urbana',
    price: 45000,
    estimatedDays: '24 a 48 horas',
    coverage: 'Suba, Usaquén, Colina Campestre, Cedritos, Santa Ana, Torca, Calle 100 hacia el norte',
  },
  {
    id: 'bogota-sur',
    name: 'Bogotá (Sur)',
    group: 'Bogotá Urbana',
    price: 50000,
    estimatedDays: '24 a 48 horas',
    coverage: 'Bosa, Ciudad Bolívar, Tunjuelito, Usme, San Cristóbal, Rafael Uribe Uribe, Soacha conurbada',
  },

  // ── 2. CUNDINAMARCA & CERCANÍAS ──────────────────────────────────────────
  {
    id: 'cundinamarca-sabana',
    name: 'Cundinamarca (Sabana)',
    group: 'Cundinamarca & Cercanías',
    price: 65000,
    estimatedDays: '24 a 48 horas',
    coverage: 'Chía, Cajicá, Cota, Zipaquirá, Sopó, Mosquera, Funza, Madrid, Facatativá, La Calera',
  },
  {
    id: 'cundinamarca-lejanias',
    name: 'Cundinamarca (Lejanías)',
    group: 'Cundinamarca & Cercanías',
    price: 95000,
    estimatedDays: '2 a 3 días hábiles',
    coverage: 'Girardot, Fusagasugá, Villeta, La Vega, Ubaté, Silvania, Tocaima, Guaduas, Pacho',
  },

  // ── 3. REGIONES PRINCIPALES ──────────────────────────────────────────────
  {
    id: 'boyaca',
    name: 'Boyacá',
    group: 'Regiones Principales',
    price: 110000,
    estimatedDays: '2 a 3 días hábiles',
    coverage: 'Tunja, Duitama, Sogamoso, Chiquinquirá, Paipa, Villa de Leyva, Moniquirá',
  },
  {
    id: 'meta',
    name: 'Meta',
    group: 'Regiones Principales',
    price: 115000,
    estimatedDays: '2 a 3 días hábiles',
    coverage: 'Villavicencio, Acacías, Restrepo, Cumaral, Granada, Puerto López',
  },
  {
    id: 'tolima-grande',
    name: 'Tolima Grande',
    group: 'Regiones Principales',
    price: 125000,
    estimatedDays: '2 a 4 días hábiles',
    coverage: 'Ibagué, Espinal, Melgar, Honda, Mariquita, Neiva, Garzón, Pitalito',
  },
  {
    id: 'eje-cafetero',
    name: 'Eje Cafetero',
    group: 'Regiones Principales',
    price: 135000,
    estimatedDays: '2 a 3 días hábiles',
    coverage: 'Pereira, Manizales, Armenia, Dosquebradas, Santa Rosa de Cabal, Calarcá, Chinchiná',
  },
  {
    id: 'antioquia',
    name: 'Antioquia',
    group: 'Regiones Principales',
    price: 145000,
    estimatedDays: '2 a 3 días hábiles',
    coverage: 'Medellín, Valle de Aburrá, Bello, Envigado, Itagüí, Sabaneta, Rionegro, La Ceja',
  },
  {
    id: 'santanderes',
    name: 'Santanderes',
    group: 'Regiones Principales',
    price: 155000,
    estimatedDays: '3 a 4 días hábiles',
    coverage: 'Bucaramanga, Floridablanca, Girón, Piedecuesta, Barrancabermeja, Cúcuta, Ocaña, Pamplona',
  },
  {
    id: 'valle-del-cauca',
    name: 'Valle del Cauca',
    group: 'Regiones Principales',
    price: 160000,
    estimatedDays: '2 a 4 días hábiles',
    coverage: 'Cali, Palmira, Yumbo, Buga, Tuluá, Jamundí, Cartago, Buenaventura',
  },

  // ── 4. COBERTURA NACIONAL & PERIFERIA ────────────────────────────────────
  {
    id: 'narino-cauca',
    name: 'Nariño / Cauca',
    group: 'Cobertura Nacional & Periferia',
    price: 185000,
    estimatedDays: '3 a 5 días hábiles',
    coverage: 'Pasto, Popayán, Ipiales, Santander de Quilichao, Tumaco, Túquerres',
  },
  {
    id: 'costa-caribe',
    name: 'Costa Caribe',
    group: 'Cobertura Nacional & Periferia',
    price: 195000,
    estimatedDays: '3 a 5 días hábiles',
    coverage: 'Barranquilla, Cartagena, Santa Marta, Valledupar, Montería, Sincelejo, Riohacha',
  },
  {
    id: 'resto-del-pais',
    name: 'Resto del País',
    group: 'Cobertura Nacional & Periferia',
    price: 230000,
    estimatedDays: '4 a 7 días hábiles',
    coverage: 'Amazonía, Orinoquía, Chocó, Arauca, Casanare, Guaviare, Putumayo, Archipiélago de San Andrés',
  },
] as const

export function getShippingZoneById(id: string): ShippingZone | undefined {
  return SHIPPING_ZONES.find((z) => z.id === id)
}

export function getDefaultShippingZone(): ShippingZone {
  return SHIPPING_ZONES[0] // Bogotá Centro / Occidente ($35.000)
}

export function getNationalFallbackZone(): ShippingZone {
  return SHIPPING_ZONES[14] // Resto del País ($230.000)
}

/**
 * Normaliza un texto de ubicación geográfica:
 * - Elimina tildes y diacríticos (ej. Medellín -> medellin, Bogotá -> bogota)
 * - Convierte a minúsculas
 * - Reemplaza signos de puntuación y separadores por espacios
 * - Colapsa espacios repetidos y elimina espacios en los extremos
 */
export function normalizeLocation(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Términos internacionales / no asegurables fuera del territorio nacional colombiano.
 * El rol adversarial bloquea despachos internacionales.
 */
const NON_COLOMBIAN_TERMS = [
  'estados unidos',
  'usa',
  'united states',
  'miami',
  'florida',
  'madrid',
  'espana',
  'spain',
  'mexico',
  'panama',
  'venezuela',
  'caracas',
  'ecuador',
  'quito',
  'peru',
  'lima',
  'chile',
  'santiago de chile',
  'argentina',
  'buenos aires',
  'canada',
  'toronto',
]

/**
 * Diccionario de mapeo determinístico de palabras clave y municipios hacia zonas de Coordinadora.
 * Ordenado por especificidad decreciente para evitar falsos positivos.
 */
interface ZoneMappingRule {
  zoneId: string
  keywords: string[]
}

const ZONE_MAPPING_RULES: ZoneMappingRule[] = [
  // ── Zonas urbanas de Bogotá con especificidad prioritaria ───────────────
  {
    zoneId: 'bogota-norte',
    keywords: [
      'bogota norte',
      'norte de bogota',
      'suba',
      'usaquen',
      'colina campestre',
      'colina',
      'cedritos',
      'santa ana',
      'torca',
      'calle 100',
      'calle 170',
      'calle 134',
      'calle 127',
      'toberin',
      'unicentro',
      'mazuren',
      'country',
      'santa barbara',
      'niza',
      'prado veraniego',
      'pontevedra',
      'san jose de bavaria',
      'guaymaral',
      'la castellana',
    ],
  },
  {
    zoneId: 'bogota-sur',
    keywords: [
      'bogota sur',
      'sur de bogota',
      'bosa',
      'ciudad bolivar',
      'tunjuelito',
      'usme',
      'san cristobal sur',
      'san cristobal',
      'rafael uribe uribe',
      'rafael uribe',
      'soacha',
      'soacha conurbada',
      'meissen',
      'perdomo',
      'tunal',
      'venecia',
      'olaya',
      'cazuca',
      'san carlos',
      'molinos',
    ],
  },
  {
    zoneId: 'bogota-centro-occidente',
    keywords: [
      'bogota',
      'bogota d c',
      'bogota dc',
      'distrito capital',
      'normandia',
      'fontibon',
      'engativa',
      'salitre',
      'ciudad salitre',
      'teusaquillo',
      'chapinero',
      'barrios unidos',
      'kennedy',
      'puente aranda',
      'candelaria',
      'la candelaria',
      'santa fe',
      'los martires',
      'martires',
      'alamos',
      'modelia',
      'castilla',
      'hayuelos',
      'galerias',
      'morato',
      'ferias',
      'minuto de dios',
      'quirigua',
      'paloquemao',
      'carvajal',
      'planta normandia',
    ],
  },

  // ── Cundinamarca Sabana (Cercanías directas a Bogotá) ────────────────────
  {
    zoneId: 'cundinamarca-sabana',
    keywords: [
      'chia',
      'cajica',
      'cota',
      'zipaquira',
      'sopo',
      'mosquera',
      'funza',
      'madrid cundinamarca',
      'madrid',
      'facatativa',
      'la calera',
      'tabio',
      'tenjo',
      'tocancipa',
      'gachancipa',
      'sibate',
      'bojaca',
      'subachoque',
      'el rosal',
      'nemocon',
      'suesca',
      'sesquile',
      'guatavita',
      'cogua',
    ],
  },

  // ── Cundinamarca Lejanías ───────────────────────────────────────────────
  {
    zoneId: 'cundinamarca-lejanias',
    keywords: [
      'girardot',
      'fusagasuga',
      'fusa',
      'villeta',
      'la vega',
      'ubate',
      'silvania',
      'tocaima',
      'guaduas',
      'pacho',
      'arbelaez',
      'chinauta',
      'anapoima',
      'la mesa',
      'apulo',
      'el colegio',
      'mesitas del colegio',
      'mesitas',
      'ricaurte',
      'san juan de rioseco',
      'nocaima',
      'nimaima',
      'choachi',
      'chipaque',
      'caqueza',
      'fomeque',
      'guayabetal',
      'agua de dios',
      'viota',
      'cachipay',
      'anolaima',
      'san bernardo cundinamarca',
      'pasca',
      'cundinamarca',
    ],
  },

  // ── Boyacá ─────────────────────────────────────────────────────────────
  {
    zoneId: 'boyaca',
    keywords: [
      'tunja',
      'duitama',
      'sogamoso',
      'chiquinquira',
      'paipa',
      'villa de leyva',
      'moniquira',
      'nobsa',
      'tibasosa',
      'samaca',
      'garagoa',
      'puerto boyaca',
      'ramiriqui',
      'turmeque',
      'tuta',
      'combita',
      'sachica',
      'raquira',
      'saboya',
      'soata',
      'guateque',
      'boyaca',
    ],
  },

  // ── Meta ───────────────────────────────────────────────────────────────
  {
    zoneId: 'meta',
    keywords: [
      'villavicencio',
      'villavo',
      'acacias',
      'restrepo meta',
      'restrepo',
      'cumaral',
      'granada meta',
      'granada',
      'puerto lopez',
      'san martin meta',
      'san martin',
      'puerto gaitan',
      'guamal',
      'castilla la nueva',
      'barranca de upia',
      'meta',
    ],
  },

  // ── Tolima Grande (Tolima + Huila) ──────────────────────────────────────
  {
    zoneId: 'tolima-grande',
    keywords: [
      'ibague',
      'espinal',
      'el espinal',
      'melgar',
      'honda tolima',
      'honda',
      'mariquita tolima',
      'mariquita',
      'neiva',
      'garzon',
      'pitalito',
      'flandes',
      'chaparral',
      'libano tolima',
      'libano',
      'purificacion',
      'guamo tolima',
      'guamo',
      'la plata huila',
      'la plata',
      'campoalegre',
      'rivera huila',
      'rivera',
      'tolima',
      'huila',
    ],
  },

  // ── Eje Cafetero (Risaralda, Caldas, Quindío) ───────────────────────────
  {
    zoneId: 'eje-cafetero',
    keywords: [
      'pereira',
      'manizales',
      'armenia',
      'dosquebradas',
      'santa rosa de cabal',
      'calarca',
      'chinchina',
      'la virginia',
      'villamaria',
      'montenegro',
      'quimbaya',
      'circasia',
      'la tebaida',
      'tebaida',
      'salento',
      'filandia',
      'eje cafetero',
      'risaralda',
      'caldas',
      'quindio',
    ],
  },

  // ── Antioquia ──────────────────────────────────────────────────────────
  {
    zoneId: 'antioquia',
    keywords: [
      'medellin',
      'valle de aburra',
      'aburra',
      'bello antioquia',
      'bello',
      'envigado',
      'itagui',
      'sabaneta',
      'rionegro',
      'la ceja',
      'copacabana antioquia',
      'copacabana',
      'girardota',
      'barbosa antioquia',
      'caldas antioquia',
      'la estrella',
      'guarne',
      'marinilla',
      'el retiro antioquia',
      'el retiro',
      'carmen de viboral',
      'el carmen de viboral',
      'apartado',
      'turbo',
      'caucasia',
      'santa fe de antioquia',
      'amalfi',
      'urrao',
      'jardin antioquia',
      'jardin',
      'jerico antioquia',
      'jerico',
      'andes antioquia',
      'andes',
      'yolombo',
      'antioquia',
    ],
  },

  // ── Santanderes (Santander y Norte de Santander) ────────────────────────
  {
    zoneId: 'santanderes',
    keywords: [
      'bucaramanga',
      'floridablanca',
      'giron',
      'piedecuesta',
      'barrancabermeja',
      'cucuta',
      'ocana',
      'pamplona',
      'los patios',
      'villa del rosario',
      'san gil',
      'socorro santander',
      'socorro',
      'lebrija',
      'malaga santander',
      'malaga',
      'tibu',
      'chinacota',
      'el zulia',
      'santander',
      'norte de santander',
    ],
  },

  // ── Valle del Cauca ─────────────────────────────────────────────────────
  {
    zoneId: 'valle-del-cauca',
    keywords: [
      'cali',
      'santiago de cali',
      'palmira',
      'yumbo',
      'buga',
      'guadalajara de buga',
      'tulua',
      'jamundi',
      'cartago',
      'buenaventura',
      'candelaria valle',
      'zarzal',
      'sevilla valle',
      'roldanillo',
      'caicedonia',
      'florida valle',
      'pradera',
      'dagua',
      'guacari',
      'ginebra valle',
      'ginebra',
      'el cerrito valle',
      'el cerrito',
      'la union valle',
      'valle del cauca',
      'valle',
    ],
  },

  // ── Nariño / Cauca ──────────────────────────────────────────────────────
  {
    zoneId: 'narino-cauca',
    keywords: [
      'pasto',
      'san juan de pasto',
      'popayan',
      'ipiales',
      'santander de quilichao',
      'tumaco',
      'tuquerres',
      'puerto asis',
      'patia',
      'el bordo',
      'piendamo',
      'puerto tejada',
      'corinto',
      'caloto',
      'guapi',
      'timbio',
      'samaniego',
      'narino',
      'cauca',
    ],
  },

  // ── Costa Caribe ────────────────────────────────────────────────────────
  {
    zoneId: 'costa-caribe',
    keywords: [
      'barranquilla',
      'cartagena',
      'cartagena de indias',
      'santa marta',
      'valledupar',
      'monteria',
      'sincelejo',
      'riohacha',
      'soledad atlantico',
      'soledad',
      'malambo',
      'puerto colombia',
      'galapa',
      'baranoa',
      'sabanalarga',
      'turbaco',
      'arjona',
      'carmen de bolivar',
      'magangue',
      'mompox',
      'cienaga magdalena',
      'cienaga',
      'fundacion magdalena',
      'fundacion',
      'el banco magdalena',
      'el banco',
      'cerete',
      'lorica',
      'sahagun',
      'montelibano',
      'aguachica',
      'codazzi',
      'bosconia',
      'maicao',
      'san juan del cesar',
      'fonseca',
      'corozal sucre',
      'corozal',
      'san onofre',
      'tolu',
      'covenas',
      'atlantico',
      'bolivar',
      'magdalena',
      'cesar',
      'cordoba',
      'la guajira',
      'guajira',
      'sucre',
      'costa caribe',
    ],
  },

  // ── Resto del País / Cobertura Nacional y Periferia ─────────────────────
  {
    zoneId: 'resto-del-pais',
    keywords: [
      'leticia',
      'yopal',
      'quibdo',
      'florencia caqueta',
      'florencia',
      'mocoa',
      'san jose del guaviare',
      'inirida',
      'mitu',
      'puerto carreno',
      'san andres islas',
      'san andres',
      'providencia',
      'arauca',
      'tame',
      'saravena',
      'aguazul',
      'tauramena',
      'villagarzon',
      'sibundoy',
      'orito',
      'valle del guamuez',
      'amazonas',
      'casanare',
      'caqueta',
      'choco',
      'guainia',
      'guaviare',
      'putumayo',
      'vaupes',
      'vichada',
      'resto del pais',
      'nacional',
    ],
  },
]

// Flattened keyword index with rules sorted by keyword length descending
interface FlatKeywordEntry {
  keyword: string
  zoneId: string
  length: number
}

const INDEXED_KEYWORDS: FlatKeywordEntry[] = ZONE_MAPPING_RULES.flatMap((rule) =>
  rule.keywords.map((kw) => ({
    keyword: normalizeLocation(kw),
    zoneId: rule.zoneId,
    length: normalizeLocation(kw).length,
  }))
).sort((a, b) => b.length - a.length)

/**
 * Cruza un string de ubicación (ciudad/municipio/departamento) contra la matriz
 * oficial de Coordinadora Mercantil con arquitectura Zero-Trust.
 * 
 * Reglas de resolución:
 * 1. Si no hay entrada (< 2 letras), entrega estimación base (Bogotá Centro).
 * 2. Si detecta país extranjero, rechaza cobertura (isCovered: false).
 * 3. Busca coincidencias directas o por palabras clave ordenadas por especificidad.
 * 4. Si la ciudad no está en la matriz principal, asigna la tarifa "Nacional / Resto del País" ($230.000).
 */
export function resolveShippingFromLocation(
  city?: string | null,
  department?: string | null
): ShippingResolution {
  const defaultZone = getDefaultShippingZone()
  const fallbackZone = getNationalFallbackZone()

  const rawCombined = [city || '', department || ''].join(' ').trim()
  const normalized = normalizeLocation(rawCombined)

  // 1. Caso sin entrada o muy corta (< 2 caracteres)
  if (!normalized || normalized.length < 2) {
    return {
      zone: defaultZone,
      matchedBy: 'default_origin',
      confidence: 'default_origin' as const,
      displayText: `Flete Coordinadora (${defaultZone.name}) — $${defaultZone.price.toLocaleString('es-CO')} COP`,
      isCovered: true,
      normalizedInput: normalized,
    }
  }

  // 2. Control Adversarial: Comprobación de país o destino internacional no asegurable
  for (const nonCo of NON_COLOMBIAN_TERMS) {
    const normTerm = normalizeLocation(nonCo)
    const regex = new RegExp(`(^|\\s)${normTerm}(\\s|$)`, 'i')
    if (regex.test(normalized)) {
      return {
        zone: fallbackZone,
        matchedBy: 'national_fallback',
        confidence: 'fallback',
        displayText: 'Despacho No Disponible — Solo Cobertura Nacional en Colombia',
        isCovered: false,
        warning: 'Coordinadora Mercantil únicamente despacha a nivel nacional dentro de Colombia.',
        normalizedInput: normalized,
      }
    }
  }

  // 3. Búsqueda determinística en la matriz indexada (especificidad descendente)
  for (const entry of INDEXED_KEYWORDS) {
    // Si coincide con la entrada completa
    if (normalized === entry.keyword) {
      const zone = getShippingZoneById(entry.zoneId) || defaultZone
      return {
        zone,
        matchedBy: 'specific_city',
        matchedTerm: entry.keyword,
        confidence: 'exact',
        displayText: `Flete Coordinadora (${zone.name}) — $${zone.price.toLocaleString('es-CO')} COP`,
        isCovered: true,
        normalizedInput: normalized,
      }
    }

    // Coincidencia con límites de palabra (evita falsos positivos como 'cali' dentro de 'calidad')
    const wordBoundaryRegex = new RegExp(`(^|\\s)${entry.keyword}(\\s|$)`, 'i')
    if (wordBoundaryRegex.test(normalized)) {
      const zone = getShippingZoneById(entry.zoneId) || defaultZone
      return {
        zone,
        matchedBy: 'specific_city',
        matchedTerm: entry.keyword,
        confidence: 'exact',
        displayText: `Flete Coordinadora (${zone.name}) — $${zone.price.toLocaleString('es-CO')} COP`,
        isCovered: true,
        normalizedInput: normalized,
      }
    }
  }

  // 4. Si la ciudad no está en la matriz principal pero tiene contenido válido:
  // Asignar tarifa "Nacional / Resto del País" por defecto ($230.000 COP)
  return {
    zone: fallbackZone,
    matchedBy: 'national_fallback',
    confidence: 'fallback',
    displayText: `Flete Coordinadora (${fallbackZone.name}) — $${fallbackZone.price.toLocaleString('es-CO')} COP`,
    isCovered: true,
    warning: 'Tarifa oficial Nacional Coordinadora asignada para este municipio.',
    normalizedInput: normalized,
  }
}

/**
 * Helper sincrónico para obtener la zona resuelta
 */
export function getZoneByCity(city?: string | null, department?: string | null): ShippingZone {
  return resolveShippingFromLocation(city, department).zone
}
