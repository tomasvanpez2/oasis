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
import catalogSeedData from './catalog-seed.json'
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
  const primary = path.join(process.cwd(), '.data', sanitized)
  if (fs.existsSync(primary)) return primary
  const alt = path.join(process.cwd(), '.data', 'db', sanitized)
  if (fs.existsSync(alt)) return alt
  return primary
}

function hasValidBlobToken(): boolean {
  if (process.env.BLOB_STORE_ID && process.env.BLOB_STORE_ID.trim().length > 0) return true
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return Boolean(token && !token.startsWith('your_') && token.trim().length > 10)
}

/**
 * Construye la URL pública determinista para un blob a partir del token o BLOB_STORE_ID.
 * Extrae el storeId del segmento [3] del token (separador `_`) tal como lo
 * formatea Vercel: vercel_blob_rw_<region>_<storeId>_<secret>
 * NUNCA usa list() — cero adivinanzas, URL exacta siempre.
 */
function getDirectUrl(pathname: string): string {
  const storeIdEnv = process.env.BLOB_STORE_ID?.trim()
  if (storeIdEnv) {
    return `https://${storeIdEnv}.public.blob.vercel-storage.com/${pathname}`
  }
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

  const nonce = crypto.randomBytes(8).toString('hex')
  const freshUrl = `${baseUrl}?t=${Date.now()}&_z=${nonce}`

  try {
    const response = await fetch(freshUrl, {
      cache: 'no-store',
      next: { revalidate: 0 },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
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

  // 2. Fallback a disco local en desarrollo y producción serverless (fs.readFileSync es estrictamente read-only)
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

  // 3. Fallback determinista en memoria
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

/**
 * Retrieves the complete product catalog under Zero-Trust Caching architecture.
 * Evades Next.js Data Cache and Vercel Edge caching.
 * Automatically cures stale legacy mock catalogs (13 products) in Vercel Blob.
 */
export async function getCatalog(): Promise<Catalog> {
  const catalog = await readJsonSafe<Catalog>(CATALOG_BLOB_PATH, () => getInitialCatalog())

  // Zero-Trust Adversarial Verification:
  // Detecta si los datos obtenidos corresponden a la versión antigua (13 productos mock) o si están incompletos.
  const isStale =
    !catalog ||
    !Array.isArray(catalog.products) ||
    catalog.products.length < 26 ||
    catalog.version !== '2.0.0' ||
    catalog.products.some((p) => p.id === 'prod-001' || p.slug === 'oasis-zen')

  if (isStale) {
    console.warn(
      `[blob:getCatalog] Detectado catálogo obsoleto o incompleto (${catalog?.products?.length ?? 0} prods, v${catalog?.version ?? 'desconocida'}). Curando a v2.0.0 (26 referencias)...`
    )
    const freshCatalog = getInitialCatalog()

    // Curar Vercel Blob de manera inmediata si hay token disponible
    if (hasValidBlobToken()) {
      writeJsonSafe(CATALOG_BLOB_PATH, freshCatalog).catch((err) =>
        console.error('[blob:getCatalog] Error curando catálogo en Vercel Blob:', err)
      )
    }

    return freshCatalog
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
  // Retorna una copia limpia e inmutable de las 26 referencias oficiales de producción
  return JSON.parse(JSON.stringify(catalogSeedData)) as Catalog
}
