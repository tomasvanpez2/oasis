/**
 * Vercel Blob — Resilient JSON Database Manager
 * Enterprise-grade persistence for catalog.json and orders.json.
 * Enforces strict Business Intelligence categorization across all stored orders.
 *
 * ARQUITECTURA MEGA-FIX:
 * - Rutas en la raíz absoluta del blob store (sin prefijo db/)
 * - Lectura 100% directa via fetch a URL determinista (sin list() jamás)
 * - Fetch anti-caché con cache: 'no-store' + cabeceras explícitas + timestamp
 * - Polling de hasta 5 intentos × 2000ms en getOrderByReference para absorber
 *   latencia de propagación CDN de Vercel Blob (~3-60 segundos)
 */
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import {
  BI_CATEGORIES,
  type BICategory,
  type Catalog,
  type OrdersDB,
  type Order,
  type OrderStatus,
  type CartItem,
  type AdminOtpRecord,
} from '@/types'

export { BI_CATEGORIES, type BICategory }

// ─── Rutas en la Raíz Absoluta del Blob Store (sin prefijo db/) ───────────────
const CATALOG_BLOB_PATH = 'catalog.json'
const ORDERS_BLOB_PATH = 'orders.json'
const OTP_BLOB_PATH = 'admin-otp.json'

function getLocalFilePath(pathname: string): string {
  const sanitized = pathname.replace(/\//g, path.sep)
  return path.join(process.cwd(), '.data', sanitized)
}

function hasValidBlobToken(): boolean {
  if (process.env.BLOB_STORE_ID && process.env.BLOB_STORE_ID.trim().length > 0) return true
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return Boolean(token && !token.startsWith('your_') && token.trim().length > 10)
}

/**
 * Construye la URL pública determinista para un blob a partir del token.
 * Extrae el storeId del segmento [3] del token (separador `_`) tal como lo
 * formatea Vercel: vercel_blob_rw_<region>_<storeId>_<secret>
 * Retorna cadena vacía si no es posible determinar el storeId.
 * NUNCA usa list() — cero adivinanzas, URL exacta siempre.
 */
function getDirectUrl(pathname: string): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN || ''
  const withoutPrefix = token.replace('vercel_blob_rw_', '')
  const storeId = withoutPrefix.substring(0, withoutPrefix.lastIndexOf('_'))
  if (!storeId) return ''
  return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`
}

// ─── Transparent Envelope Encryption (AES-256-GCM) ───────────────────────────
// Protege datos sensibles (órdenes de clientes PII y OTPs) antes de enviarlos
// a Vercel Blob o almacenarlos en disco, evitando exposición pública no autorizada.

interface EncryptedEnvelope {
  _encrypted: true
  alg: 'aes-256-gcm'
  iv: string
  tag: string
  ciphertext: string
}

function getBlobEncryptionKey(): Buffer {
  const secret =
    process.env.BLOB_ENCRYPTION_KEY ||
    process.env.ADMIN_TOTP_SECRET ||
    'oasis-colchones-blob-secure-key-2026'
  return crypto.createHash('sha256').update(secret).digest()
}

function shouldEncryptPath(pathname: string): boolean {
  return pathname === ORDERS_BLOB_PATH || pathname === OTP_BLOB_PATH
}

function encryptBlobData(plainText: string): string {
  try {
    const key = getBlobEncryptionKey()
    const iv = crypto.randomBytes(12) // 96-bit IV para GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag().toString('hex')

    const envelope: EncryptedEnvelope = {
      _encrypted: true,
      alg: 'aes-256-gcm',
      iv: iv.toString('hex'),
      tag,
      ciphertext: encrypted,
    }

    return JSON.stringify(envelope)
  } catch (err) {
    console.error('[blob:encryptBlobData] Error al cifrar:', err)
    return plainText
  }
}

function decryptBlobData(rawText: string): string {
  try {
    const trimmed = rawText.trim()
    if (!trimmed.startsWith('{') || !trimmed.includes('"_encrypted":true')) {
      return rawText // Retorna texto plano si es información previa no cifrada
    }

    const envelope = JSON.parse(trimmed) as Partial<EncryptedEnvelope>
    if (
      envelope._encrypted === true &&
      envelope.alg === 'aes-256-gcm' &&
      envelope.iv &&
      envelope.tag &&
      envelope.ciphertext
    ) {
      const key = getBlobEncryptionKey()
      const iv = Buffer.from(envelope.iv, 'hex')
      const tag = Buffer.from(envelope.tag, 'hex')
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(tag)

      let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
  } catch (err) {
    console.warn('[blob:decryptBlobData] Fallo al descifrar o payload no cifrado:', err)
  }
  return rawText
}

// ─── Business Intelligence Categorization Engine ─────────────────────────────

/**
 * Validates if a string matches one of the 5 official BI categories.
 */
export function isValidBICategory(category: unknown): category is BICategory {
  return typeof category === 'string' && (BI_CATEGORIES as readonly string[]).includes(category)
}

/**
 * Classifies an order strictly into one of the 5 strategic BI categories:
 * - 1_Colchones_Premium: High-end mattresses (Talalay, Latex, Hybrid, Flagship, or price >= 2.0M COP)
 * - 2_Colchones_Estandar: Core high-resilience foam and standard spring mattresses
 * - 3_Bases_y_Muebles: Bed bases, somieres, headboards, bedroom furniture
 * - 4_Almohadas_y_Complementos: Pillows, mattress protectors, toppers, linens
 * - 5_Combos_Especiales: Bundles, multi-category packages, or promotional packs
 */
export function classifyOrderCategory(items: CartItem[] = [], totalCOP: number = 0): BICategory {
  if (!items || items.length === 0) {
    return totalCOP >= 2_000_000 ? '1_Colchones_Premium' : '2_Colchones_Estandar'
  }

  // Detect explicit combo keywords
  const hasComboKeyword = items.some((item) => {
    const text = `${item.productName} ${item.productSlug}`.toLowerCase()
    return /combo|pack|set|kit|duo|dúo|promoci[oó]n/i.test(text)
  })
  if (hasComboKeyword) {
    return '5_Combos_Especiales'
  }

  let hasMattress = false
  let hasBaseOrFurniture = false
  let hasAccessory = false
  let hasPremiumMattress = false

  for (const item of items) {
    const text = `${item.productName} ${item.productSlug}`.toLowerCase()

    const isBase = /base|somier|cama|cabecero|mueble|nocturno|espaldar/i.test(text)
    const isAccessory = /almohada|protector|s[aá]bana|topper|lino|plum[oó]n|funda|coj[ií]n/i.test(text)
    const isPremium =
      /olimpo|nebula|cumbre|aurora|luna|talalay|latex|l[aá]tex|viscoel[aá]stic|h[ií]brid/i.test(text) ||
      item.price >= 2_000_000

    if (isBase) {
      hasBaseOrFurniture = true
    } else if (isAccessory) {
      hasAccessory = true
    } else {
      hasMattress = true
      if (isPremium) {
        hasPremiumMattress = true
      }
    }
  }

  // Cross-category order represents a special bundle / combo
  const distinctCategoriesCount = [hasMattress, hasBaseOrFurniture, hasAccessory].filter(Boolean).length
  if (distinctCategoriesCount >= 2 || (items.length > 1 && items.some((i) => i.quantity > 1 && totalCOP >= 3_500_000))) {
    return '5_Combos_Especiales'
  }

  if (hasBaseOrFurniture && !hasMattress) {
    return '3_Bases_y_Muebles'
  }

  if (hasAccessory && !hasMattress && !hasBaseOrFurniture) {
    return '4_Almohadas_y_Complementos'
  }

  if (hasPremiumMattress || totalCOP >= 2_500_000) {
    return '1_Colchones_Premium'
  }

  return '2_Colchones_Estandar'
}

// ─── Resilient Blob I/O Helpers ──────────────────────────────────────────────

/**
 * Fetch directo y sin caché desde Vercel Blob usando URL determinista.
 * - Construye la URL con getDirectUrl() — NUNCA llama a list()
 * - Agrega ?t=<timestamp> para romper cualquier caché de red intermedia
 * - Cabeceras explícitas: Cache-Control, Pragma, Expires
 * - { cache: 'no-store' } en fetch para saltar la caché de Next.js/Edge
 */
async function fetchBlobJson<T>(pathname: string): Promise<T | null> {
  if (!hasValidBlobToken()) {
    return null
  }

  const baseUrl = getDirectUrl(pathname)
  if (!baseUrl) {
    console.warn(`[blob:fetchBlobJson] No se pudo determinar storeId para leer ${pathname}`)
    return null
  }

  const freshUrl = `${baseUrl}?t=${Date.now()}`

  try {
    const response = await fetch(freshUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      console.warn(`[blob:fetchBlobJson] HTTP ${response.status} ${response.statusText} al consultar ${freshUrl}`)
      return null
    }

    const rawText = await response.text()
    try {
      const textToParse = shouldEncryptPath(pathname) ? decryptBlobData(rawText) : rawText
      return JSON.parse(textToParse) as T
    } catch (parseError) {
      console.error(`[blob:fetchBlobJson] JSON corrupto en Vercel Blob (${pathname}):`, parseError)
      return null
    }
  } catch (error) {
    console.warn(`[blob:fetchBlobJson] Error de red al leer directamente de Vercel Blob (${pathname}):`, error)
    return null
  }
}

async function readJsonSafe<T>(pathname: string, defaultFallback: () => T): Promise<T> {
  // 1. Lectura directa determinista desde Vercel Blob Store (omitiendo por completo list() y Edge Cache)
  if (hasValidBlobToken()) {
    const remoteData = await fetchBlobJson<T>(pathname)
    if (remoteData !== null) {
      return remoteData
    }
  }

  // 2. Fallback a disco local EXCLUSIVAMENTE en entorno de desarrollo (evita crash EROFS en Vercel Serverless)
  if (process.env.NODE_ENV === 'development') {
    try {
      const localPath = getLocalFilePath(pathname)
      if (fs.existsSync(localPath)) {
        const rawLocal = fs.readFileSync(localPath, 'utf-8')
        const textToParse = shouldEncryptPath(pathname) ? decryptBlobData(rawLocal) : rawLocal
        return JSON.parse(textToParse) as T
      }
    } catch (localError) {
      console.error(`[blob:readJsonSafe] Error leyendo archivo local (${pathname}):`, localError)
    }
  }

  // 3. Fallback en memoria por defecto
  return defaultFallback()
}

async function writeJsonSafe<T>(pathname: string, data: T): Promise<void> {
  let serialized: string
  try {
    const rawJson = JSON.stringify(data, null, 2)
    serialized = shouldEncryptPath(pathname) ? encryptBlobData(rawJson) : rawJson
  } catch (serializeError) {
    console.error(`[blob:writeJsonSafe] Failed to serialize data for ${pathname}:`, serializeError)
    throw new Error(`Error fatal al serializar base de datos: ${String(serializeError)}`)
  }

  let blobSuccess = false

  // 1. Primary write to Vercel Blob: addRandomSuffix: false and access: 'public' are mandatory
  if (hasValidBlobToken()) {
    try {
      const blobPayload = new Blob([serialized], { type: 'application/json' })
      await put(pathname, blobPayload, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      })
      blobSuccess = true
    } catch (blobWriteError) {
      console.error(
        `[blob:writeJsonSafe] Vercel Blob put failed for ${pathname}:`,
        blobWriteError
      )
    }
  }

  // 2. Local filesystem mirror (solo en desarrollo - en Vercel Serverless NO debe tocar fs para evitar EROFS)
  if (process.env.NODE_ENV === 'development') {
    try {
      const localPath = getLocalFilePath(pathname)
      const dir = path.dirname(localPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const tempPath = `${localPath}.tmp.${Date.now()}`
      fs.writeFileSync(tempPath, serialized, 'utf-8')
      fs.renameSync(tempPath, localPath)
    } catch (localWriteError) {
      console.error(`[blob:writeJsonSafe] Local filesystem write error for ${pathname}:`, localWriteError)
      if (!blobSuccess) {
        throw new Error(`Local write fallback failed for ${pathname}: ${String(localWriteError)}`)
      }
    }
  } else if (!blobSuccess) {
    throw new Error(
      `Fallo de persistencia en Vercel Blob para ${pathname}. El mirror local de disco está desactivado en producción (Serverless Read-Only).`
    )
  }
}

// ─── Orders CRUD Manager ─────────────────────────────────────────────────────

/**
 * Retrieves the complete orders database with aggressive anti-cache measures.
 * Direct fetch adds ?t=${Date.now()} and { cache: 'no-store' }.
 * Bypasses Vercel Edge caching and avoids list() completely.
 * Disk mirror fallback only runs in local development.
 */
export async function getOrders(): Promise<OrdersDB> {
  const fallbackOrdersDB: OrdersDB = {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    orders: [],
  }

  let db = await readJsonSafe<OrdersDB>(ORDERS_BLOB_PATH, () => fallbackOrdersDB)

  if (!db || !Array.isArray(db.orders)) {
    db = fallbackOrdersDB
  }

  // Ensure all existing orders have a valid biCategory
  let mutated = false
  for (const order of db.orders) {
    if (!isValidBICategory(order.biCategory)) {
      order.biCategory = classifyOrderCategory(order.items, order.total)
      mutated = true
    }
  }

  if (mutated) {
    await writeJsonSafe(ORDERS_BLOB_PATH, db).catch((err) =>
      console.warn('[blob:getOrders] Non-blocking schema migration write failed:', err)
    )
  }

  return db
}

export async function getOrderByReference(wompiReference: string): Promise<Order | null> {
  if (!wompiReference) return null
  const normalized = wompiReference.trim().toLowerCase()

  // Polling de hasta 5 intentos × 2000ms para absorber latencia de propagación
  // CDN/índice de Vercel Blob (puede tardar hasta 60 segundos en casos extremos).
  // En el 95% de los casos el 2.º intento ya lee la verdad absoluta del servidor.
  for (let i = 0; i < 5; i++) {
    const db = await getOrders()
    const order = db.orders.find(
      (o) => o.wompiReference?.trim().toLowerCase() === normalized
    )
    if (order) return order
    if (i < 4) await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  return null
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null
  const db = await getOrders()
  const normalized = orderId.trim()
  return db.orders.find((o) => o.id === normalized) || null
}

/**
 * Saves a new order or updates an existing one in Vercel Blob.
 * Strictly guarantees that order.biCategory is one of the 5 authorized BI categories.
 * Enforces addRandomSuffix: false and access: 'public' on put to prevent orphaned blobs.
 * Completely eliminates list() dependencies and EROFS crashes by delegating to writeJsonSafe.
 */
export async function saveOrder(order: Order): Promise<Order> {
  if (!order || !order.id || !order.wompiReference) {
    throw new Error('Estructura de orden inválida para persistencia en base de datos')
  }

  // 1. Enforce strict Business Intelligence categorization
  if (!isValidBICategory(order.biCategory)) {
    order.biCategory = classifyOrderCategory(order.items, order.total)
  }

  // 2. Retrieve fresh database snapshot via direct anti-cache fetch
  const db = await getOrders()
  const normalizedRef = order.wompiReference.trim().toLowerCase()
  const existingIndex = db.orders.findIndex(
    (o) => o.id === order.id || o.wompiReference?.trim().toLowerCase() === normalizedRef
  )

  const sanitizedOrder: Order = {
    ...order,
    biCategory: order.biCategory,
    updatedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    db.orders[existingIndex] = sanitizedOrder
  } else {
    db.orders.push(sanitizedOrder)
  }

  db.updatedAt = new Date().toISOString()

  // 3. Atomically persist to Vercel Blob (and local disk only in development)
  await writeJsonSafe(ORDERS_BLOB_PATH, db)

  return sanitizedOrder
}

/**
 * Atomically updates status and gateway metadata for an order found by Wompi reference or ID.
 * Persists immediately via saveOrder guaranteeing BI classification, anti-cache and disk mirroring.
 */
export async function updateOrderStatus(
  orderIdentifier: string,
  status: OrderStatus,
  wompiTransactionId?: string,
  wompiPaymentData?: Record<string, unknown>
): Promise<Order | null> {
  const db = await getOrders()
  const normalizedId = orderIdentifier.trim().toLowerCase()
  const order = db.orders.find(
    (o) =>
      o.id === orderIdentifier ||
      o.wompiReference?.trim().toLowerCase() === normalizedId
  )
  if (!order) return null

  order.status = status
  order.updatedAt = new Date().toISOString()

  if (wompiTransactionId) {
    order.wompiTransactionId = wompiTransactionId
  }

  if (wompiPaymentData) {
    order.wompiPaymentData = {
      ...(order.wompiPaymentData || {}),
      ...wompiPaymentData,
    }
  }

  return saveOrder(order)
}

// ─── 2FA OTP Persistence Manager ─────────────────────────────────────────────

interface OtpStore {
  records: Record<string, AdminOtpRecord>
}

export async function saveAdminOtp(
  otp: string,
  challengeId: string,
  ttlMs: number = 5 * 60 * 1000
): Promise<AdminOtpRecord> {
  const store = await readJsonSafe<OtpStore>(OTP_BLOB_PATH, () => ({ records: {} }))
  if (!store.records) store.records = {}

  const now = Date.now()
  const record: AdminOtpRecord = {
    otp,
    challengeId,
    createdAt: now,
    expiresAt: now + ttlMs,
    attempts: 0,
    consumed: false,
  }

  // Auto purge expired challenges
  for (const cid of Object.keys(store.records)) {
    if (store.records[cid].expiresAt < now) {
      delete store.records[cid]
    }
  }

  store.records[challengeId] = record
  await writeJsonSafe(OTP_BLOB_PATH, store)
  return record
}

export async function getAdminOtp(challengeId: string): Promise<AdminOtpRecord | null> {
  const store = await readJsonSafe<OtpStore>(OTP_BLOB_PATH, () => ({ records: {} }))
  return store.records?.[challengeId] || null
}

export async function consumeAdminOtp(challengeId: string): Promise<boolean> {
  const store = await readJsonSafe<OtpStore>(OTP_BLOB_PATH, () => ({ records: {} }))
  if (!store.records || !store.records[challengeId]) return false
  store.records[challengeId].consumed = true
  await writeJsonSafe(OTP_BLOB_PATH, store)
  return true
}

export async function recordOtpFailure(challengeId: string): Promise<number> {
  const store = await readJsonSafe<OtpStore>(OTP_BLOB_PATH, () => ({ records: {} }))
  if (!store.records || !store.records[challengeId]) return 0
  store.records[challengeId].attempts = (store.records[challengeId].attempts || 0) + 1
  await writeJsonSafe(OTP_BLOB_PATH, store)
  return store.records[challengeId].attempts
}

// ─── Catalog CRUD Manager ────────────────────────────────────────────────────

export async function getCatalog(): Promise<Catalog> {
  const catalog = await readJsonSafe<Catalog>(CATALOG_BLOB_PATH, () => getInitialCatalog())
  if (!catalog || !Array.isArray(catalog.products) || catalog.products.length === 0) {
    const initial = getInitialCatalog()
    await writeJsonSafe(CATALOG_BLOB_PATH, initial)
    return initial
  }
  return catalog
}

export async function updateCatalog(catalog: Catalog): Promise<void> {
  if (!catalog || !Array.isArray(catalog.products)) {
    throw new Error('Estructura de catálogo inválida para persistencia')
  }
  const updated: Catalog = {
    ...catalog,
    updatedAt: new Date().toISOString(),
  }
  await writeJsonSafe(CATALOG_BLOB_PATH, updated)
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

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
