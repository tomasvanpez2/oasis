// ─── Product & Catalog ──────────────────────────────────────────────────────

export type MattressSize = 'Sencillo' | 'Semi-doble' | 'Doble' | 'Queen' | 'King'

export interface ProductVariant {
  size: MattressSize
  dimensions: string // e.g. "90 × 190 cm"
  price: number // COP
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  longDescription: string
  category: 'espuma' | 'resortes' | 'latex' | 'premium'
  technology: string[]
  materials: string[]
  imageUrl: string
  imageGallery: string[]
  variants: ProductVariant[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface Catalog {
  version: string
  updatedAt: string
  products: Product[]
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string
  productName: string
  productSlug: string
  size: MattressSize
  dimensions: string
  price: number
  quantity: number
  imageUrl: string
  biCategory?: BICategory
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, size: MattressSize) => void
  updateQuantity: (productId: string, size: MattressSize, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// ─── Business Intelligence Categories ────────────────────────────────────────

export const BI_CATEGORIES = [
  '1_Colchones_Premium',
  '2_Colchones_Estandar',
  '3_Bases_y_Muebles',
  '4_Almohadas_y_Complementos',
  '5_Combos_Especiales',
] as const

export type BICategory = (typeof BI_CATEGORIES)[number]

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'voided'
  | 'error'

export interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  document: string
  documentType: 'CC' | 'CE' | 'NIT' | 'PP'
  city: string
  address: string
  notes?: string
  shippingZoneId?: string
  shippingZoneName?: string
}

export interface Order {
  id: string
  wompiTransactionId?: string
  wompiReference: string
  status: OrderStatus
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  shipping: number
  shippingZone?: string
  total: number
  currency: 'COP'
  biCategory: BICategory
  createdAt: string
  updatedAt: string
  wompiPaymentMethod?: string
  wompiInstallments?: number
  wompiPaymentData?: Record<string, unknown>
}

export interface OrdersDB {
  version: string
  updatedAt: string
  orders: Order[]
}

// ─── Wompi Security & Integration ───────────────────────────────────────────

export interface WompiKeysConfig {
  publicKey: string
  privateKey: string
  eventsSecret: string
  integritySecret: string
  isProduction: boolean
}

export interface WompiCheckoutParams {
  reference: string
  amountInCents: number
  currency?: 'COP'
  customer: CustomerInfo
  redirectUrl?: string
  integrityHash?: string
  publicKey?: string
}

export interface WompiWebhookSignature {
  properties: string[]
  checksum: string
}

export interface WompiTransaction {
  id: string
  created_at: string
  finalized_at: string | null
  amount_in_cents: number
  reference: string
  customer_email: string
  currency: string
  payment_method_type: string
  payment_method: Record<string, unknown>
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING' | string
  status_message: string | null
  merchant: Record<string, unknown>
  taxes: unknown[]
  tip_in_cents: number
  shipping_address?: Record<string, unknown>
  redirect_url?: string
  payment_link_id?: string
  customer_data?: Record<string, unknown>
}

export interface WompiWebhookEvent {
  event: string
  data: {
    transaction: WompiTransaction
  }
  environment: string
  signature: WompiWebhookSignature
  timestamp: number
  sent_at: string
}

// ─── Telegram Bot API ────────────────────────────────────────────────────────

export interface TelegramSendMessagePayload {
  chat_id: string | number
  text: string
  parse_mode?: 'Markdown' | 'HTML'
  disable_web_page_preview?: boolean
}

export interface TelegramApiResponse<T = unknown> {
  ok: boolean
  result?: T
  error_code?: number
  description?: string
}

// ─── Checkout Form Data (Zero PCI Scope) ─────────────────────────────────────

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  documentType: 'CC' | 'CE' | 'NIT' | 'PP'
  document: string
  shippingZoneId: string
  city: string
  address: string
  notes?: string
  acceptTerms: boolean
}
