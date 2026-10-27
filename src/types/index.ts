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
}

export interface Order {
  id: string
  wompiTransactionId?: string
  wompiReference: string
  status: OrderStatus
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  shipping: number // 0 = liquidar por separado
  total: number
  currency: 'COP'
  createdAt: string
  updatedAt: string
  wompiPaymentMethod?: string
  wompiPaymentData?: Record<string, unknown>
}

export interface OrdersDB {
  version: string
  updatedAt: string
  orders: Order[]
}

// ─── Wompi ───────────────────────────────────────────────────────────────────

export interface WompiTransactionRequest {
  amount_in_cents: number
  currency: 'COP'
  customer_email: string
  reference: string
  payment_method: WompiCardPaymentMethod
  customer_data: {
    phone_number: string
    full_name: string
    legal_id: string
    legal_id_type: string
  }
  shipping_address?: {
    address_line_1: string
    city: string
    region: string
    name: string
    phone_number: string
    postal_code?: string
    country: 'CO'
  }
}

export interface WompiCardPaymentMethod {
  type: 'CARD' | 'NEQUI' | 'BANCOLOMBIA_TRANSFER'
  token?: string
  installments?: number
  user_type?: 'PERSON' | 'COMPANY'
}

export interface WompiWebhookEvent {
  event: string
  data: {
    transaction: WompiTransaction
  }
  environment: string
  signature: {
    properties: string[]
    checksum: string
  }
  timestamp: number
  sent_at: string
}

export interface WompiTransaction {
  id: string
  created_at: string
  finalized_at: string
  amount_in_cents: number
  reference: string
  customer_email: string
  currency: string
  payment_method_type: string
  payment_method: Record<string, unknown>
  status: string
  status_message: string
  merchant: Record<string, unknown>
  taxes: unknown[]
  tip_in_cents: number
  shipping_address?: Record<string, unknown>
  redirect_url?: string
  payment_link_id?: string
  customer_data?: Record<string, unknown>
}

// ─── Checkout Form ───────────────────────────────────────────────────────────

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  documentType: 'CC' | 'CE' | 'NIT' | 'PP'
  document: string
  city: string
  address: string
  notes: string
  cardNumber: string
  cardHolder: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  installments: number
}
