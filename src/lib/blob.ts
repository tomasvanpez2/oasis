/**
 * Vercel Blob — JSON file-based database utilities
 * Reads and writes catalog.json and orders.json as structured JSON
 */
import { put, list } from '@vercel/blob'
import type { Catalog, OrdersDB } from '@/types'
import fs from 'fs'
import path from 'path'

const CATALOG_PATH = 'db/catalog.json'
const ORDERS_PATH = 'db/orders.json'

function getLocalFallbackPath(pathname: string): string {
  const sanitized = pathname.replace(/\//g, path.sep)
  return path.join(process.cwd(), '.data', sanitized)
}

// ─── Generic Helpers ──────────────────────────────────────────────────────────

async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  const hasToken =
    !!process.env.BLOB_READ_WRITE_TOKEN &&
    !process.env.BLOB_READ_WRITE_TOKEN.startsWith('your_')

  if (hasToken) {
    try {
      // List blobs to find exact URL
      const { blobs } = await list({ prefix: pathname })
      const blob = blobs.find((b) => b.pathname === pathname)
      if (blob) {
        const res = await fetch(blob.url, { cache: 'no-store' })
        if (res.ok) {
          const text = await res.text()
          return JSON.parse(text) as T
        }
      }
    } catch (err) {
      console.warn(`[blob:read] Vercel Blob access failed for ${pathname}, using local fallback:`, err)
    }
  }

  // Local filesystem fallback
  try {
    const localFile = getLocalFallbackPath(pathname)
    if (fs.existsSync(localFile)) {
      const raw = fs.readFileSync(localFile, 'utf-8')
      return JSON.parse(raw) as T
    }
  } catch (localErr) {
    console.error(`[blob:local] Read error:`, localErr)
  }

  return null
}

async function writeJsonBlob<T>(pathname: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2)
  const hasToken =
    !!process.env.BLOB_READ_WRITE_TOKEN &&
    !process.env.BLOB_READ_WRITE_TOKEN.startsWith('your_')

  if (hasToken) {
    try {
      const blob = new Blob([json], { type: 'application/json' })
      await put(pathname, blob, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      })
      return
    } catch (err) {
      console.warn(`[blob:write] Vercel Blob write failed, writing to local fallback:`, err)
    }
  }

  // Local filesystem fallback
  try {
    const localFile = getLocalFallbackPath(pathname)
    const dir = path.dirname(localFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(localFile, json, 'utf-8')
  } catch (localErr) {
    console.error(`[blob:local] Write error:`, localErr)
  }
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function getCatalog(): Promise<Catalog> {
  const data = await readJsonBlob<Catalog>(CATALOG_PATH)
  if (data) return data

  // Initialize with seed data if blob doesn't exist
  const initial = getInitialCatalog()
  await writeJsonBlob(CATALOG_PATH, initial)
  return initial
}

export async function updateCatalog(catalog: Catalog): Promise<void> {
  const updated: Catalog = {
    ...catalog,
    updatedAt: new Date().toISOString(),
  }
  await writeJsonBlob(CATALOG_PATH, updated)
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<OrdersDB> {
  const data = await readJsonBlob<OrdersDB>(ORDERS_PATH)
  if (data) return data

  const initial: OrdersDB = {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    orders: [],
  }
  await writeJsonBlob(ORDERS_PATH, initial)
  return initial
}

export async function saveOrder(order: import('@/types').Order): Promise<void> {
  const db = await getOrders()

  const existingIndex = db.orders.findIndex((o) => o.id === order.id)
  if (existingIndex >= 0) {
    db.orders[existingIndex] = { ...order, updatedAt: new Date().toISOString() }
  } else {
    db.orders.push(order)
  }

  db.updatedAt = new Date().toISOString()
  await writeJsonBlob(ORDERS_PATH, db)
}

export async function updateOrderStatus(
  wompiReference: string,
  status: import('@/types').OrderStatus,
  wompiTransactionId?: string,
  wompiPaymentData?: Record<string, unknown>
): Promise<import('@/types').Order | null> {
  const db = await getOrders()
  const order = db.orders.find((o) => o.wompiReference === wompiReference)
  if (!order) return null

  order.status = status
  order.updatedAt = new Date().toISOString()
  if (wompiTransactionId) order.wompiTransactionId = wompiTransactionId
  if (wompiPaymentData) order.wompiPaymentData = wompiPaymentData

  db.updatedAt = new Date().toISOString()
  await writeJsonBlob(ORDERS_PATH, db)
  return order
}

// ─── Seed Catalog ─────────────────────────────────────────────────────────────

function getInitialCatalog(): Catalog {
  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    products: [
      {
        id: 'prod-001',
        slug: 'oasis-zen',
        name: 'Oasis Zen',
        tagline: 'Descanso en su forma más pura.',
        description: 'Espuma de alta densidad HR-40 con núcleo ortopédico de doble zona.',
        longDescription:
          'El Oasis Zen es nuestra entrada al ecosistema de descanso técnico. Construido con espuma de alta resiliencia HR-40 y un núcleo ortopédico de doble zona de presión, distribuye el peso corporal con precisión matemática. La capa superior de memory foam de 3 cm absorbe micro-movimientos para un descanso sin interrupciones.',
        category: 'espuma',
        technology: ['HR-40 Alta Resiliencia', 'Doble Zona Ortopédica', 'Memory Foam 3cm'],
        materials: ['Espuma HR-40', 'Memory Foam', 'Forro Tencel'],
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        imageGallery: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
        ],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 890000, stock: 15 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1050000, stock: 12 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1180000, stock: 10 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1320000, stock: 8 },
          { size: 'King', dimensions: '200 × 200 cm', price: 1580000, stock: 5 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-002',
        slug: 'oasis-noche',
        name: 'Oasis Noche',
        tagline: 'Arquitectura de resortes para soporte preciso.',
        description: 'Sistema de resortes ensacados independientes con 800 espirales por unidad Queen.',
        longDescription:
          'El Oasis Noche redefine el soporte con 800 resortes ensacados independientes en tamaño Queen. Cada espiral trabaja de forma autónoma, eliminando la transferencia de movimiento y adaptando el soporte a cada zona del cuerpo. El acolchado superior de espuma HR-35 de 5 cm garantiza la transición perfecta entre firmeza y confort.',
        category: 'resortes',
        technology: ['800 Resortes Ensacados', 'Independencia de Movimiento', 'HR-35 Acolchado'],
        materials: ['Acero Templado', 'Espuma HR-35', 'Algodón Natural', 'Forro Bambú'],
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        imageGallery: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
        ],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1280000, stock: 10 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1480000, stock: 8 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1680000, stock: 7 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1950000, stock: 6 },
          { size: 'King', dimensions: '200 × 200 cm', price: 2350000, stock: 4 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-003',
        slug: 'oasis-aurora',
        name: 'Oasis Aurora',
        tagline: 'Látex natural. Elasticidad sin memoria artificial.',
        description: 'Látex natural Dunlop de 10 cm sobre base de resortes ensacados.',
        longDescription:
          'El látex natural Dunlop del Oasis Aurora proviene de plantaciones certificadas de Hevea brasiliensis. Su estructura celular abierta garantiza una ventilación del 3× superior a la espuma convencional, mientras su densidad de 65 kg/m³ mantiene la forma durante décadas sin hundimientos. Antiestático, antimicrobiano por naturaleza.',
        category: 'latex',
        technology: ['Látex Dunlop Natural', 'Certificado Oeko-Tex', 'Ventilación Activa'],
        materials: ['Látex Natural 65 kg/m³', 'Resortes Ensacados', 'Forro Algodón Orgánico'],
        imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
        imageGallery: [
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
          'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&q=80',
        ],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1890000, stock: 6 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 2180000, stock: 5 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 2490000, stock: 4 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 2850000, stock: 3 },
          { size: 'King', dimensions: '200 × 200 cm', price: 3380000, stock: 2 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-004',
        slug: 'oasis-sol',
        name: 'Oasis Sol',
        tagline: 'Firmeza progresiva para columna vertebral.',
        description: 'Espuma de alta densidad HD-45 con tecnología de firmeza por zonas.',
        longDescription:
          'Diseñado con el input de fisioterapeutas colombianos, el Oasis Sol implementa firmeza progresiva: mayor resistencia en la zona lumbar, moderada en hombros y cintura. La espuma HD-45 de alta densidad resiste deformación permanente por 15 años certificados.',
        category: 'espuma',
        technology: ['HD-45 Alta Densidad', 'Firmeza por Zonas', 'Anti-deformación 15 años'],
        materials: ['Espuma HD-45', 'Espuma HR-38 Zona Media', 'Forro Microfibra'],
        imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 980000, stock: 14 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1150000, stock: 11 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1290000, stock: 9 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1450000, stock: 7 },
          { size: 'King', dimensions: '200 × 200 cm', price: 1720000, stock: 5 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-005',
        slug: 'oasis-luna',
        name: 'Oasis Luna',
        tagline: 'Gel-infused para regulación térmica activa.',
        description: 'Memory foam infusionado con gel de enfriamiento activo, 5 cm de confort.',
        longDescription:
          'El Oasis Luna integra partículas de gel de enfriamiento en cada célula del memory foam. La temperatura de superficie se mantiene entre 2°C y 3°C más fresca que la espuma convencional, ideal para climas tropicales. El efecto abrazo progresivo del memory foam reduce 67% los puntos de presión.',
        category: 'premium',
        technology: ['Gel Cooling Technology', 'Memory Foam Premium', 'Regulación Térmica Activa'],
        materials: ['Memory Foam + Gel 5cm', 'Espuma Base HR-40', 'Forro 3D Air Mesh'],
        imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1480000, stock: 9 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1720000, stock: 7 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1950000, stock: 6 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 2180000, stock: 5 },
          { size: 'King', dimensions: '200 × 200 cm', price: 2680000, stock: 3 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-006',
        slug: 'oasis-terra',
        name: 'Oasis Terra',
        tagline: 'Firmeza clásica. Durabilidad sin concesiones.',
        description: 'Resortes bonell reforzados con acolchado de algodón natural prensado.',
        longDescription:
          'El Oasis Terra es nuestro referente de durabilidad artesanal. Los resortes Bonell de calibre 13.5 están tejidos en una estructura unitaria que distribuye el peso de forma uniforme. El acolchado de 8 cm de algodón natural prensado aporta esa firmeza clásica que las generaciones anteriores reconocen como el estándar del buen descanso.',
        category: 'resortes',
        technology: ['Resortes Bonell Cal. 13.5', 'Algodón Natural Prensado', 'Estructura Unitaria'],
        materials: ['Acero Cal. 13.5', 'Algodón Natural 8cm', 'Sisal', 'Forro Jacquard'],
        imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 750000, stock: 20 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 890000, stock: 15 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 990000, stock: 12 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1150000, stock: 10 },
          { size: 'King', dimensions: '200 × 200 cm', price: 1380000, stock: 6 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-007',
        slug: 'oasis-cumbre',
        name: 'Oasis Cumbre',
        tagline: 'Resortes de bolsillo premium. 1000 espirales Queen.',
        description: 'Máxima densidad de resortes ensacados con pillow top removible de memory foam.',
        longDescription:
          'El Oasis Cumbre alcanza la máxima densidad de soporte con 1000 resortes ensacados en tamaño Queen. El pillow top removible y lavable de 5 cm de memory foam premium permite adaptar la sensación de confort sin cambiar el colchón base. Sistema de manijas reforzadas para rotación semestral recomendada.',
        category: 'premium',
        technology: ['1000 Resortes Ensacados', 'Pillow Top Removible', 'Memory Foam Premium'],
        materials: ['Acero Templado', 'Memory Foam 5cm', 'Microfibra Premium', 'Forro Tencel'],
        imageUrl: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 2180000, stock: 6 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 2580000, stock: 5 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 2950000, stock: 4 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 3380000, stock: 3 },
          { size: 'King', dimensions: '200 × 200 cm', price: 4050000, stock: 2 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-008',
        slug: 'oasis-pluma',
        name: 'Oasis Pluma',
        tagline: 'Ultra-suave. Microfibra conjugada de cuatro canales.',
        description: 'Núcleo de espuma suave HR-28 con doble capa de microfibra conjugada.',
        longDescription:
          'Para quienes duermen de lado o prefieren la sensación de hundirse en el descanso. El Oasis Pluma usa espuma HR-28 de baja resistencia calibrada para no comprometer el soporte lumbar, combinada con dos capas de microfibra conjugada de cuatro canales que simulan la sensación del plumón sin sus alergias.',
        category: 'espuma',
        technology: ['HR-28 Baja Resistencia', 'Microfibra 4 Canales', 'Anti-alérgico'],
        materials: ['Espuma HR-28', 'Microfibra Conjugada', 'Forro Satín'],
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 820000, stock: 13 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 980000, stock: 10 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1120000, stock: 8 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1280000, stock: 6 },
          { size: 'King', dimensions: '200 × 200 cm', price: 1550000, stock: 4 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-009',
        slug: 'oasis-carbon',
        name: 'Oasis Carbón',
        tagline: 'Espuma activa con carbón activado antibacterial.',
        description: 'HR-38 infusionado con partículas de carbón activado para descanso higiénico.',
        longDescription:
          'La espuma del Oasis Carbón incorpora partículas de carbón activado de bambú en su estructura celular. El carbón absorbe olores, reduce bacterias y neutraliza humedad de forma pasiva sin químicos añadidos. Certificado por GREENGUARD Gold para uso en habitaciones con niños y personas sensibles.',
        category: 'espuma',
        technology: ['Carbón Activado Bambú', 'GREENGUARD Gold', 'Anti-bacteriano Pasivo'],
        materials: ['Espuma HR-38 + Carbón', 'Espuma Base HR-35', 'Forro Tencel Antibacterial'],
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1150000, stock: 11 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1350000, stock: 9 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1520000, stock: 7 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1720000, stock: 5 },
          { size: 'King', dimensions: '200 × 200 cm', price: 2050000, stock: 3 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-010',
        slug: 'oasis-atlas',
        name: 'Oasis Atlas',
        tagline: 'Resortes de doble temple para uso intensivo.',
        description: 'Para hoteles y uso intensivo: resortes doble temple con 120,000 ciclos certificados.',
        longDescription:
          'El Oasis Atlas está diseñado para soportar uso hotelero intensivo. Sus resortes de doble temple certificados para 120,000 ciclos de carga/descarga mantienen el 95% de su altura original después de 10 años de uso diario. Forro antibacterial de nivel hospitalario con tratamiento de plata iónica.',
        category: 'resortes',
        technology: ['Doble Temple 120K Ciclos', 'Plata Iónica Antibacterial', 'Certificado Hotelero'],
        materials: ['Acero Doble Temple', 'Espuma HR-42', 'Forro Plata Iónica'],
        imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 1380000, stock: 8 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 1620000, stock: 6 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1850000, stock: 5 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 2150000, stock: 4 },
          { size: 'King', dimensions: '200 × 200 cm', price: 2580000, stock: 3 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-011',
        slug: 'oasis-nebula',
        name: 'Oasis Nebula',
        tagline: 'Híbrido látex-resortes. El mejor de dos mundos.',
        description: 'Capa de látex Talalay de 6 cm sobre base de 800 resortes ensacados.',
        longDescription:
          'El Oasis Nebula combina la elasticidad instantánea del látex Talalay con la independencia de soporte de los resortes ensacados. El látex Talalay, procesado en celdas abiertas, supera al Dunlop en ventilación y rebote. La combinación crea una sensación flotante única: sin el hundimiento del memory foam ni la rigidez del resorte puro.',
        category: 'latex',
        technology: ['Látex Talalay 6cm', '800 Resortes Ensacados', 'Sensación Flotante'],
        materials: ['Látex Talalay', 'Acero Templado', 'Espuma Transición HR-35', 'Forro Bambú'],
        imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 2580000, stock: 5 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 2980000, stock: 4 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 3380000, stock: 3 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 3850000, stock: 2 },
          { size: 'King', dimensions: '200 × 200 cm', price: 4680000, stock: 1 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-012',
        slug: 'oasis-piedra',
        name: 'Oasis Piedra',
        tagline: 'Extra-firme para lesiones lumbares y columna.',
        description: 'El más firme de nuestra línea: HD-50 con soporte ortopédico máximo.',
        longDescription:
          'Desarrollado en colaboración con ortopedistas de la Clínica de la Costa, el Oasis Piedra ofrece la máxima firmeza ortopédica con espuma HD-50 de 18 cm. Diseñado específicamente para personas en recuperación de cirugías de columna, hernias discales o con indicación médica de superficie firme. Sin capas de confort sobre el núcleo.',
        category: 'espuma',
        technology: ['HD-50 Máxima Densidad', 'Ortopédico Certificado', 'Sin Capa Suave Superior'],
        materials: ['Espuma HD-50 18cm', 'Forro Ortopédico Tejido Plano'],
        imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 780000, stock: 16 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 920000, stock: 13 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 1050000, stock: 10 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 1220000, stock: 8 },
          { size: 'King', dimensions: '200 × 200 cm', price: 1480000, stock: 5 },
        ],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod-013',
        slug: 'oasis-olimpo',
        name: 'Oasis Olimpo',
        tagline: 'La cumbre. Látex Talalay + 1000 resortes + pillow top.',
        description: 'Nuestra referencia flagship: tres capas de tecnología combinada.',
        longDescription:
          'El Oasis Olimpo es la culminación de veinte años de manufactura colombiana de descanso. Base de 1000 resortes de doble temple, capa de transición de espuma viscoelástica de 3 cm, corazón de látex Talalay de 8 cm, y pillow top removible de memory foam gel-infused de 5 cm. Un colchón que se reinventa con cada cara y se mantiene perfecto por décadas.',
        category: 'premium',
        technology: ['1000 Resortes Doble Temple', 'Látex Talalay 8cm', 'Gel Memory Foam Pillow Top', 'Cuatro Tecnologías'],
        materials: ['Acero Doble Temple', 'Látex Talalay', 'Memory Foam + Gel', 'Viscoelástica', 'Forro Tencel Premium'],
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
        imageGallery: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80'],
        variants: [
          { size: 'Sencillo', dimensions: '90 × 190 cm', price: 3980000, stock: 4 },
          { size: 'Semi-doble', dimensions: '120 × 190 cm', price: 4680000, stock: 3 },
          { size: 'Doble', dimensions: '140 × 190 cm', price: 5380000, stock: 2 },
          { size: 'Queen', dimensions: '160 × 190 cm', price: 6180000, stock: 2 },
          { size: 'King', dimensions: '200 × 200 cm', price: 7480000, stock: 1 },
        ],
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }
}
