/**
 * Oasis Colchones — Matriz Logística de Despachos Coordinadora Mercantil
 * Origen Oficial: Bodega Central de Confección — Barrio Normandía, Bogotá D.C.
 * 
 * Tarifas oficiales de carga pesada / volumétrica para colchones individuales y dobles.
 * Tarifa económica de Coordinadora Carga aplicada directamente en checkout.
 */

export interface ShippingZone {
  id: string
  name: string
  group: 'Bogotá Urbana' | 'Cundinamarca & Cercanías' | 'Regiones Principales' | 'Cobertura Nacional & Periferia'
  price: number // COP
  estimatedDays: string
  coverage: string
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
  return SHIPPING_ZONES[0] // Bogotá Centro / Occidente
}

