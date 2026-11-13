/**
 * Oasis Colchones — Matriz Logística Oficial: Transporte Propio & Coordinadora
 * Origen: Bodega Central de Confección — Barrio Normandía, Bogotá D.C.
 * 
 * Flota propia y cuadrilla técnica especializada para colchones y bases.
 * Coordinadora Mercantil para despacho contra entrega de accesorios exclusivos.
 * Cobro del flete al 100% al cliente (Cero subsidios ni apoyos por volumen).
 */

export const DELIVERY_TIME_TEXT = 'Entrega coordinada por mensaje' as const
export const COORDINADORA_ACCESSORIES_TEXT = 'Envío por Coordinadora (Pago contra entrega)' as const

export const ALLOWED_CITIES = ['Cota', 'Chía', 'Cajicá', 'Bogotá'] as const
export type AllowedCity = (typeof ALLOWED_CITIES)[number]

/**
 * Las 20 localidades oficiales del Distrito Capital de Bogotá
 */
export const BOGOTA_LOCALIDADES = [
  'Antonio Nariño',
  'Barrios Unidos',
  'Bosa',
  'Chapinero',
  'Ciudad Bolívar',
  'Engativá',
  'Fontibón',
  'Kennedy',
  'La Candelaria',
  'Los Mártires',
  'Puente Aranda',
  'Rafael Uribe Uribe',
  'San Cristóbal',
  'Santa Fe',
  'Suba',
  'Sumapaz',
  'Teusaquillo',
  'Tunjuelito',
  'Usaquén',
  'Usme',
] as const

export type BogotaLocalidad = (typeof BOGOTA_LOCALIDADES)[number]

export interface ShippingZone {
  id: string
  name: string
  city: string
  localidad?: string
  price: number // COP (100% cobrado al cliente, o 0 para accesorios exclusivos)
  estimatedDays: string
  coverage: string
}

export interface ShippingResolution {
  zone: ShippingZone
  matchedBy: 'city' | 'localidad' | 'accessories' | 'default'
  confidence: 'exact' | 'fallback'
  displayText: string
  isCovered: boolean
  warning?: string
  normalizedInput?: string
  isAccessoriesOnly?: boolean
}

export const TRANSPORTE_PROPIO_ORIGIN = {
  city: 'Bogotá, D.C.',
  neighborhood: 'Normandía (Engativá)',
  postalCode: '111071',
  facility: 'Planta de Producción y Bodega Central Oasis Colchones',
} as const

/**
 * Matriz estricta de tarifas fijas para municipios de la Sabana
 */
export const SABANA_RATES: Record<'Cota' | 'Chía' | 'Cajicá', { price: number; id: string; name: string }> = {
  'Cota': { id: 'cota-propio', name: 'Cota', price: 20000 },
  'Chía': { id: 'chia-propio', name: 'Chía', price: 25000 },
  'Cajicá': { id: 'cajica-propio', name: 'Cajicá', price: 30000 },
}

/**
 * Clasificación y tarifas de las 20 localidades de Bogotá D.C.
 * Grupo 1 ($35.000): Suba, Engativá, Fontibón, Barrios Unidos, Teusaquillo, Chapinero, Usaquén
 * Grupo 2 ($45.000): Kennedy, Bosa, Puente Aranda, Mártires, Santa Fe, Candelaria, Antonio Nariño,
 *                    Tunjuelito, Rafael Uribe, San Cristóbal, Ciudad Bolívar, Usme, Sumapaz
 */
interface LocalidadRateEntry {
  group: 1 | 2
  price: number
  canonicalName: BogotaLocalidad
}

export const BOGOTA_LOCALIDAD_RATES: Record<string, LocalidadRateEntry> = {
  // ── Grupo 1: $35.000 ──
  'suba': { group: 1, price: 35000, canonicalName: 'Suba' },
  'engativa': { group: 1, price: 35000, canonicalName: 'Engativá' },
  'engativá': { group: 1, price: 35000, canonicalName: 'Engativá' },
  'fontibon': { group: 1, price: 35000, canonicalName: 'Fontibón' },
  'fontibón': { group: 1, price: 35000, canonicalName: 'Fontibón' },
  'barrios unidos': { group: 1, price: 35000, canonicalName: 'Barrios Unidos' },
  'teusaquillo': { group: 1, price: 35000, canonicalName: 'Teusaquillo' },
  'chapinero': { group: 1, price: 35000, canonicalName: 'Chapinero' },
  'usaquen': { group: 1, price: 35000, canonicalName: 'Usaquén' },
  'usaquén': { group: 1, price: 35000, canonicalName: 'Usaquén' },

  // ── Grupo 2: $45.000 ──
  'kennedy': { group: 2, price: 45000, canonicalName: 'Kennedy' },
  'bosa': { group: 2, price: 45000, canonicalName: 'Bosa' },
  'puente aranda': { group: 2, price: 45000, canonicalName: 'Puente Aranda' },
  'martires': { group: 2, price: 45000, canonicalName: 'Los Mártires' },
  'mártires': { group: 2, price: 45000, canonicalName: 'Los Mártires' },
  'los martires': { group: 2, price: 45000, canonicalName: 'Los Mártires' },
  'los mártires': { group: 2, price: 45000, canonicalName: 'Los Mártires' },
  'santa fe': { group: 2, price: 45000, canonicalName: 'Santa Fe' },
  'santafé': { group: 2, price: 45000, canonicalName: 'Santa Fe' },
  'candelaria': { group: 2, price: 45000, canonicalName: 'La Candelaria' },
  'la candelaria': { group: 2, price: 45000, canonicalName: 'La Candelaria' },
  'antonio nariño': { group: 2, price: 45000, canonicalName: 'Antonio Nariño' },
  'antonio narino': { group: 2, price: 45000, canonicalName: 'Antonio Nariño' },
  'tunjuelito': { group: 2, price: 45000, canonicalName: 'Tunjuelito' },
  'rafael uribe': { group: 2, price: 45000, canonicalName: 'Rafael Uribe Uribe' },
  'rafael uribe uribe': { group: 2, price: 45000, canonicalName: 'Rafael Uribe Uribe' },
  'san cristobal': { group: 2, price: 45000, canonicalName: 'San Cristóbal' },
  'san cristóbal': { group: 2, price: 45000, canonicalName: 'San Cristóbal' },
  'ciudad bolivar': { group: 2, price: 45000, canonicalName: 'Ciudad Bolívar' },
  'ciudad bolívar': { group: 2, price: 45000, canonicalName: 'Ciudad Bolívar' },
  'usme': { group: 2, price: 45000, canonicalName: 'Usme' },
  'sumapaz': { group: 2, price: 45000, canonicalName: 'Sumapaz' },
}

/**
 * Normaliza nombres para comparación robusta
 */
export function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Comprueba si una localidad corresponde a una de las 20 localidades oficiales de Bogotá
 */
export function isValidBogotaLocalidad(localidad?: string | null): boolean {
  if (!localidad || typeof localidad !== 'string') return false
  const key = normalizeKey(localidad)
  return Boolean(
    BOGOTA_LOCALIDAD_RATES[key] ||
    BOGOTA_LOCALIDAD_RATES[localidad.trim().toLowerCase()]
  )
}

/**
 * Listado hardcodeado y estricto basado EXCLUSIVAMENTE en las zonas aprobadas del documento fuente.
 * Cualquier zona fuera de esta lista NO debe existir como opción.
 */
export const APPROVED_SHIPPING_ZONES: readonly ShippingZone[] = [
  {
    id: 'cota-propio',
    name: 'Cota',
    city: 'Cota',
    price: 20000,
    estimatedDays: DELIVERY_TIME_TEXT,
    coverage: 'Zona urbana y rural de Cota, Cundinamarca',
  },
  {
    id: 'chia-propio',
    name: 'Chía',
    city: 'Chía',
    price: 25000,
    estimatedDays: DELIVERY_TIME_TEXT,
    coverage: 'Zona urbana y veredas de Chía, Cundinamarca',
  },
  {
    id: 'cajica-propio',
    name: 'Cajicá',
    city: 'Cajicá',
    price: 30000,
    estimatedDays: DELIVERY_TIME_TEXT,
    coverage: 'Zona urbana y sectores de Cajicá, Cundinamarca',
  },
  {
    id: 'bogota-grupo-1',
    name: 'Bogotá (Zona Norte / Occidente)',
    city: 'Bogotá',
    price: 35000,
    estimatedDays: DELIVERY_TIME_TEXT,
    coverage: 'Suba, Engativá, Fontibón, Barrios Unidos, Teusaquillo, Chapinero, Usaquén',
  },
  {
    id: 'bogota-grupo-2',
    name: 'Bogotá (Zona Sur / Centro / Oriente)',
    city: 'Bogotá',
    price: 45000,
    estimatedDays: DELIVERY_TIME_TEXT,
    coverage: 'Kennedy, Bosa, Puente Aranda, Mártires, Santa Fe, Candelaria, Antonio Nariño, Tunjuelito, Rafael Uribe, San Cristóbal, Ciudad Bolívar, Usme, Sumapaz',
  },
] as const

export const SHIPPING_ZONES = APPROVED_SHIPPING_ZONES

/**
 * Zona por defecto para estados iniciales del carrito
 */
export function getDefaultShippingZone(): ShippingZone {
  return APPROVED_SHIPPING_ZONES[3] // Bogotá Grupo 1 ($35.000)
}

/**
 * Búsqueda de zona por identificador
 */
export function getShippingZoneById(id: string): ShippingZone | undefined {
  const predefined = APPROVED_SHIPPING_ZONES.find((z) => z.id === id)
  if (predefined) return predefined

  // Si es un id dinámico de Bogotá por localidad:
  if (id.startsWith('bogota-')) {
    if (id.includes('grupo-2')) return APPROVED_SHIPPING_ZONES[4]
    return APPROVED_SHIPPING_ZONES[3]
  }

  return undefined
}

/**
 * Determina si un ítem individual corresponde a un accesorio (almohadas, sábanas, protectores)
 */
export function isAccessoryItem(item: {
  category?: string
  productSlug?: string
  productName?: string
}): boolean {
  if (item.category) {
    const cat = item.category.toLowerCase().trim()
    if (['almohadas', 'protectores', 'sabanas'].includes(cat)) {
      return true
    }
  }
  const slug = (item.productSlug || '').toLowerCase()
  const name = (item.productName || '').toLowerCase()

  return (
    slug.startsWith('almohada') ||
    slug.startsWith('protector') ||
    slug.startsWith('juego-de-sabanas') ||
    name.includes('almohada') ||
    name.includes('protector') ||
    name.includes('sábana') ||
    name.includes('sabana')
  )
}

/**
 * Determina si el carrito contiene EXCLUSIVAMENTE accesorios (almohadas, sábanas, protectores).
 * Si contiene aunque sea un colchón, colchoneta o base, retorna false.
 */
export function isOnlyAccessories(items: Array<{
  category?: string
  productSlug?: string
  productName?: string
}>): boolean {
  if (!items || items.length === 0) return false
  return items.every(isAccessoryItem)
}

/**
 * Determina si un producto es de referencia resortada (Panel Bonell o Pocket con marco de acero).
 * La opción Tipo Libro SOLO puede estar disponible si la referencia es resortada y el tamaño es Queen o King.
 * Colchonetas, Semi-Anatómico y Clínico NO tienen esta opción.
 */
export function isResortadoProduct(product: {
  slug?: string
  name?: string
  technology?: string[]
  materials?: string[]
  category?: string
}): boolean {
  const slug = (product.slug || '').toLowerCase()

  // Exclusiones explícitas según regla de negocio
  if (
    slug.includes('colchoneta') ||
    slug.includes('semi-anatomico') ||
    slug.includes('clinico') ||
    slug.includes('espuma-rosada')
  ) {
    return false
  }

  // Lista autorizada de referencias resortadas
  const resortadoSlugs = [
    'colchon-semi-ortopedico-resortado',
    'colchon-ortopedico-resortado',
    'colchon-imitacion-pillow-penta',
    'colchon-imitacion-pillow-antiescaras',
    'colchon-pillow-top-original',
    'colchon-pillow-top-encapsulado',
    'colchon-pillow-top-pocket-resortes-independientes',
  ]

  if (resortadoSlugs.includes(slug)) return true

  // Verificación por materiales y tecnología
  const techString = (
    (product.technology || []).join(' ') +
    ' ' +
    (product.materials || []).join(' ') +
    ' ' +
    (product.name || '')
  ).toLowerCase()

  return (
    techString.includes('bonell') ||
    techString.includes('pocket') ||
    (techString.includes('resort') && !techString.includes('sin resortes'))
  )
}

/**
 * Resolución estricta de fletes con Transporte Propio o Coordinadora.
 * - Cobro del flete al 100% al cliente (CERO subsidios, CERO descuentos por volumen).
 * - Si el carrito contiene EXCLUSIVAMENTE accesorios: Costo de envío = $0 y texto Coordinadora contra entrega.
 */
export function resolveShippingFromLocation(
  city?: string | null,
  localidad?: string | null,
  items?: Array<{ category?: string; productSlug?: string; productName?: string }>
): ShippingResolution {
  // ── Lógica de Accesorios Exclusivos ──
  if (items && isOnlyAccessories(items)) {
    const coordZone: ShippingZone = {
      id: 'coordinadora-contra-entrega',
      name: 'Coordinadora (Contra Entrega)',
      city: city || 'Colombia',
      localidad: localidad || undefined,
      price: 0,
      estimatedDays: '2 a 4 días hábiles',
      coverage: 'Cobertura nacional por Coordinadora Mercantil (Pago contra entrega)',
    }

    return {
      zone: coordZone,
      matchedBy: 'accessories',
      confidence: 'exact',
      displayText: COORDINADORA_ACCESSORIES_TEXT,
      isCovered: true,
      normalizedInput: city || 'Accesorios Exclusivos',
      isAccessoriesOnly: true,
    }
  }

  const defaultZone = getDefaultShippingZone()

  // 1. Caso sin ciudad seleccionada
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return {
      zone: defaultZone,
      matchedBy: 'default',
      confidence: 'fallback',
      displayText: 'Selecciona tu ciudad para liquidar el flete',
      isCovered: false,
      warning: 'Por favor selecciona una ciudad (Cota, Chía, Cajicá o Bogotá).',
      normalizedInput: '',
      isAccessoriesOnly: false,
    }
  }

  const trimmedCity = city.trim()

  // 2. Control de ciudades Sabana: Cota, Chía, Cajicá (Flete cobrado al 100%)
  if (trimmedCity === 'Cota' || trimmedCity === 'Chía' || trimmedCity === 'Cajicá') {
    const rate = SABANA_RATES[trimmedCity]
    const zone: ShippingZone = {
      id: rate.id,
      name: rate.name,
      city: trimmedCity,
      price: rate.price, // 100% al cliente
      estimatedDays: DELIVERY_TIME_TEXT,
      coverage: `Despacho directo con Transporte Propio a ${rate.name}`,
    }

    return {
      zone,
      matchedBy: 'city',
      confidence: 'exact',
      displayText: `Flete Transporte Propio (${rate.name}) — $${rate.price.toLocaleString('es-CO')} COP`,
      isCovered: true,
      normalizedInput: trimmedCity,
      isAccessoriesOnly: false,
    }
  }

  // 3. Control para Bogotá D.C. con Localidad obligatoria (Flete cobrado al 100%)
  if (trimmedCity === 'Bogotá') {
    if (!localidad || typeof localidad !== 'string' || localidad.trim().length === 0) {
      return {
        zone: defaultZone,
        matchedBy: 'city',
        confidence: 'fallback',
        displayText: 'Selecciona tu localidad en Bogotá',
        isCovered: false,
        warning: 'Debes seleccionar una localidad oficial de Bogotá para liquidar el flete.',
        normalizedInput: 'Bogotá',
        isAccessoriesOnly: false,
      }
    }

    const trimmedLoc = localidad.trim()
    const directEntry = BOGOTA_LOCALIDAD_RATES[trimmedLoc.toLowerCase()]
    const normKey = normalizeKey(trimmedLoc)
    const normEntry = BOGOTA_LOCALIDAD_RATES[normKey]
    const matchedEntry = directEntry || normEntry

    if (!matchedEntry) {
      return {
        zone: defaultZone,
        matchedBy: 'city',
        confidence: 'fallback',
        displayText: 'Localidad no reconocida en Bogotá',
        isCovered: false,
        warning: 'La localidad seleccionada no figura entre las 20 localidades oficiales de Bogotá.',
        normalizedInput: `Bogotá - ${trimmedLoc}`,
        isAccessoriesOnly: false,
      }
    }

    const zoneId = matchedEntry.group === 1 ? 'bogota-grupo-1' : 'bogota-grupo-2'
    const zone: ShippingZone = {
      id: `${zoneId}-${normKey.replace(/\s+/g, '-')}`,
      name: `Bogotá (${matchedEntry.canonicalName})`,
      city: 'Bogotá',
      localidad: matchedEntry.canonicalName,
      price: matchedEntry.price, // 100% al cliente
      estimatedDays: DELIVERY_TIME_TEXT,
      coverage: `Bogotá D.C. — Localidad ${matchedEntry.canonicalName}`,
    }

    return {
      zone,
      matchedBy: 'localidad',
      confidence: 'exact',
      displayText: `Flete Transporte Propio (Bogotá — ${matchedEntry.canonicalName}) — $${matchedEntry.price.toLocaleString('es-CO')} COP`,
      isCovered: true,
      normalizedInput: `Bogotá - ${matchedEntry.canonicalName}`,
      isAccessoriesOnly: false,
    }
  }

  // 4. Ciudades fuera del perímetro de Transporte Propio
  return {
    zone: defaultZone,
    matchedBy: 'default',
    confidence: 'fallback',
    displayText: 'Destino sin cobertura de Transporte Propio',
    isCovered: false,
    warning: 'Transporte Propio opera exclusivamente en Cota, Chía, Cajicá y Bogotá D.C.',
    normalizedInput: trimmedCity,
    isAccessoriesOnly: false,
  }
}

/**
 * Helper sincrónico para obtener la zona resuelta
 */
export function getZoneByCity(
  city?: string | null,
  localidad?: string | null,
  items?: Array<{ category?: string; productSlug?: string; productName?: string }>
): ShippingZone {
  return resolveShippingFromLocation(city, localidad, items).zone
}
