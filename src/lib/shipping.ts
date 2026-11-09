/**
 * Oasis Colchones — Matriz Logística Oficial: Transporte Propio
 * Origen: Bodega Central de Confección — Barrio Normandía, Bogotá D.C.
 * 
 * Flota propia y cuadrilla técnica especializada.
 * Mapa estricto de clave-valor sin cruces difusos ni dependencias externas.
 */

export const DELIVERY_TIME_TEXT = 'Entrega coordinada por mensaje' as const

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
  price: number // COP
  estimatedDays: string // Strictly 'Entrega coordinada por mensaje'
  coverage: string
}

export interface ShippingResolution {
  zone: ShippingZone
  matchedBy: 'city' | 'localidad' | 'default'
  confidence: 'exact' | 'fallback'
  displayText: string
  isCovered: boolean
  warning?: string
  normalizedInput?: string
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
 * Lista general de zonas oficiales preconfiguradas
 */
export const SHIPPING_ZONES: readonly ShippingZone[] = [
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
]

/**
 * Zona por defecto para estados iniciales del carrito
 */
export function getDefaultShippingZone(): ShippingZone {
  return SHIPPING_ZONES[3] // Bogotá Grupo 1 ($35.000)
}

/**
 * Búsqueda de zona por identificador
 */
export function getShippingZoneById(id: string): ShippingZone | undefined {
  const predefined = SHIPPING_ZONES.find((z) => z.id === id)
  if (predefined) return predefined

  // Si es un id dinámico de Bogotá por localidad:
  if (id.startsWith('bogota-')) {
    const defaultZone = getDefaultShippingZone()
    return defaultZone
  }

  return undefined
}

/**
 * Resolución estricta de fletes con Transporte Propio.
 * Cero heurísticas difusas, cero tolerancias para orígenes no autorizados.
 */
export function resolveShippingFromLocation(
  city?: string | null,
  localidad?: string | null
): ShippingResolution {
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
    }
  }

  const trimmedCity = city.trim()

  // 2. Control de ciudades Sabana: Cota, Chía, Cajicá
  if (trimmedCity === 'Cota' || trimmedCity === 'Chía' || trimmedCity === 'Cajicá') {
    const rate = SABANA_RATES[trimmedCity]
    const zone: ShippingZone = {
      id: rate.id,
      name: rate.name,
      city: trimmedCity,
      price: rate.price,
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
    }
  }

  // 3. Control para Bogotá D.C. con Localidad obligatoria
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
      }
    }

    const zoneId = matchedEntry.group === 1 ? 'bogota-grupo-1' : 'bogota-grupo-2'
    const zone: ShippingZone = {
      id: `${zoneId}-${normKey.replace(/\s+/g, '-')}`,
      name: `Bogotá (${matchedEntry.canonicalName})`,
      city: 'Bogotá',
      localidad: matchedEntry.canonicalName,
      price: matchedEntry.price,
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
  }
}

/**
 * Helper sincrónico para obtener la zona resuelta
 */
export function getZoneByCity(city?: string | null, localidad?: string | null): ShippingZone {
  return resolveShippingFromLocation(city, localidad).zone
}
