/**
 * Telegram Bot API Notification Service & WhatsApp Deep Link Engine
 * Dispatches real-time, structured operational notifications to the factory group.
 * Strictly details the order, total amount in COP, and strategic BI category.
 * Embeds high-conversion inline WhatsApp contact button with sanitized Colombian phone.
 */
import type {
  Order,
  TelegramApiResponse,
  TelegramSendMessagePayload,
} from '@/types'
import { formatCOP } from '@/lib/utils'

const TELEGRAM_API_BASE = 'https://api.telegram.org'
const DISPATCH_TIMEOUT_MS = 10000

export interface TelegramNotificationResult {
  success: boolean
  messageId?: number
  error?: string
}

interface TelegramMessageResult {
  message_id: number
  date: number
  text: string
  chat: {
    id: number
    title?: string
    type: string
  }
}

export function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Sanitizes Colombian customer phone numbers for WhatsApp API (wa.me):
 * - Strips all non-digit characters (spaces, dashes, parentheses, +, etc.).
 * - Strips leading trunk zeros (e.g. 0310... -> 310...).
 * - Guarantees Colombia country code (57) prefix without symbols or spaces.
 * 
 * Examples:
 * - "324 525 9548"     -> "573245259548"
 * - "+57 300 123 4567"  -> "573001234567"
 * - "573104567890"      -> "573104567890"
 * - "(601) 234-5678"    -> "576012345678"
 */
export function sanitizeColombianPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  let cleaned = phone.replace(/\D/g, '')

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '')

  // Already prefixed with 57 and has full length (57 + 10 digits = 12 digits)
  if (cleaned.startsWith('57') && cleaned.length >= 12) {
    return cleaned
  }

  // If already starts with 57 and has exactly 10 digits
  if (cleaned.startsWith('57') && cleaned.length === 10) {
    return cleaned
  }

  // 10 digits (Standard Colombian mobile 3xx xxx xxxx or landline 60x xxx xxxx)
  if (cleaned.length === 10) {
    return `57${cleaned}`
  }

  // If doesn't start with 57, prepend 57
  if (!cleaned.startsWith('57')) {
    return `57${cleaned}`
  }

  return cleaned
}

/**
 * Builds the exact prefabricated WhatsApp customer message:
 * "Hola [Nombre], somos Oasis Colchones. Hemos recibido tu pedido [Referencia] por [Total]. Te escribimos para confirmar el despacho hacia [Ciudad/Zona]."
 */
export function buildWhatsAppCustomerMessage(order: Order): string {
  const customerName = order.customer?.fullName?.trim() || 'Cliente'
  const reference = order.wompiReference || order.id
  const formattedTotal = `${formatCOP(order.total).replace(/\u00A0/g, ' ')} COP`
  const destination = order.shippingZone || order.customer?.city || 'tu ciudad'

  return `Hola ${customerName}, somos Oasis Colchones. Hemos recibido tu pedido ${reference} por ${formattedTotal}. Te escribimos para confirmar el despacho hacia ${destination}.`
}

/**
 * Builds the authenticated wa.me URL with sanitized phone and URL-encoded prefabricated message.
 */
export function buildWhatsAppLink(order: Order): string | null {
  const rawPhone = order.customer?.phone || ''
  const sanitized = sanitizeColombianPhone(rawPhone)
  if (!sanitized || sanitized.length < 10) return null

  const message = buildWhatsAppCustomerMessage(order)
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`
}

/**
 * Builds a clean, high-impact HTML notification for factory floor operations.
 */
export function buildFactoryOrderMessage(order: Order): string {
  const statusEmoji: Record<string, string> = {
    approved: '✅ PAGO APROBADO EN WOMPI',
    production: '🏭 EN PRODUCCIÓN',
    dispatched: '🚚 DESPACHADO',
    delivered: '📦 ENTREGADO',
    declined: '❌ PAGO DECLINADO',
    pending: '⏳ TRANSACCIÓN PENDIENTE',
    voided: '🚫 PAGO ANULADO',
    error: '⚠️ ERROR EN TRANSACCIÓN',
  }

  const statusHeader = statusEmoji[order.status] || `📋 ESTADO: ${order.status.toUpperCase()}`

  // Product breakdown
  const itemsBreakdown = (order.items || [])
    .map((item, index) => {
      const lineTotal = formatCOP(item.price * item.quantity)
      return (
        `  ${index + 1}. <b>${escapeHtml(item.productName)}</b>\n` +
        `     • Medida: ${escapeHtml(item.size)} (${escapeHtml(item.dimensions)})\n` +
        `     • Cantidad: ${item.quantity} × ${formatCOP(item.price)} = <b>${lineTotal}</b>`
      )
    })
    .join('\n\n')

  const shippingNote =
    order.shippingZone
      ? `🚛 <b>Flete Coordinadora:</b> ${formatCOP(order.shipping)} (Origen: Bodega Normandía → ${escapeHtml(order.shippingZone)})`
      : `🚛 <b>Flete Coordinadora:</b> ${formatCOP(order.shipping)} (Origen: Bodega Normandía)`

  const installmentsText =
    order.wompiInstallments && order.wompiInstallments > 1
      ? `${order.wompiInstallments} cuotas diferidas`
      : '1 cuota (Pago de contado / Débito directo)'

  const dateBogota = new Date(order.createdAt).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const rawPhone = order.customer?.phone || ''
  const sanitizedTel = sanitizeColombianPhone(rawPhone)

  return `
🛏️ <b>OASIS COLCHONES — ORDEN DE PRODUCCIÓN</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>${statusHeader}</b>

📊 <b>CATEGORÍA BI:</b> <code>${order.biCategory}</code>
📋 <b>Referencia:</b> <code>${escapeHtml(order.wompiReference)}</code>
${order.wompiTransactionId ? `🔗 <b>ID Wompi:</b> <code>${escapeHtml(order.wompiTransactionId)}</code>\n` : ''}📅 <b>Fecha (Col):</b> ${dateBogota}

👤 <b>DATOS DE FACTURACIÓN Y DESPACHO</b>
• <b>Cliente:</b> ${escapeHtml(order.customer?.fullName || 'N/A')}
• <b>Documento:</b> ${escapeHtml(order.customer?.documentType || 'CC')} ${escapeHtml(order.customer?.document || 'N/A')}
• <b>Teléfono:</b> <a href="tel:${sanitizedTel}">${escapeHtml(rawPhone)}</a>
• <b>Email:</b> ${escapeHtml(order.customer?.email || 'N/A')}
• <b>Ciudad:</b> ${escapeHtml(order.customer?.city || 'N/A')}
• <b>Dirección:</b> ${escapeHtml(order.customer?.address || 'N/A')}
${order.customer?.notes ? `• <b>Notas de entrega:</b> <i>${escapeHtml(order.customer.notes)}</i>\n` : ''}
🛒 <b>DETALLE DE PRODUCTOS</b>
${itemsBreakdown}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>LIQUIDACIÓN FINANCIERA</b>
• Subtotal: ${formatCOP(order.subtotal)}
• ${shippingNote}
• <b>TOTAL PAGADO: ${formatCOP(order.total)} COP</b>
• <b>Método:</b> ${escapeHtml(order.wompiPaymentMethod || 'Wompi Web Checkout Seguro')}
• <b>Cuotas (Installments):</b> ${escapeHtml(installmentsText)}
`.trim()
}

/**
 * Sends an automated, formatted Telegram notification to the factory group.
 * Embeds an inline WhatsApp reply_markup keyboard button with wa.me API link.
 */
export async function sendOrderNotification(order: Order): Promise<TelegramNotificationResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    const message = '[telegram:warn] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID. Skipping dispatch.'
    console.warn(message)
    return { success: false, error: message }
  }

  const messageHtml = buildFactoryOrderMessage(order)
  const endpoint = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`

  const payload: TelegramSendMessagePayload = {
    chat_id: chatId,
    text: messageHtml,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  // Embed WhatsApp inline keyboard button
  const waLink = buildWhatsAppLink(order)
  if (waLink) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: '💬 Contactar al Cliente por WhatsApp',
            url: waLink,
          },
        ],
      ],
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })

    const body: TelegramApiResponse<TelegramMessageResult> = await response.json()

    if (!response.ok || !body.ok) {
      const errorMsg = `[telegram:error] HTTP ${response.status}: ${body.description || 'Unknown Telegram API error'}`
      console.error(errorMsg, { errorCode: body.error_code, reference: order.wompiReference })
      return { success: false, error: errorMsg }
    }

    console.info(
      `[telegram:success] Notification dispatched for ref ${order.wompiReference}. Msg ID: ${body.result?.message_id} (Category: ${order.biCategory})`
    )

    return {
      success: true,
      messageId: body.result?.message_id,
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const errorMsg = isTimeout
      ? `[telegram:timeout] Dispatch exceeded ${DISPATCH_TIMEOUT_MS}ms timeout`
      : `[telegram:exception] Network error: ${error instanceof Error ? error.message : String(error)}`

    console.error(errorMsg, { reference: order.wompiReference })
    return { success: false, error: errorMsg }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Dispatches 6-digit 2FA OTP code directly to the factory Telegram group.
 */
export async function sendTelegramOTP(otp: string): Promise<TelegramNotificationResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    const message = `[telegram:warn] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID. OTP dispatch skipped.`
    console.warn(message)
    return { success: false, error: message }
  }

  const endpoint = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`

  const text = `
🔐 <b>CÓDIGO DE ACCESO 2FA — OASIS ADMIN</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Se ha iniciado una solicitud de acceso al Panel Administrativo Privado de Oasis Colchones.

Tu código de verificación de un solo uso es:
👉 <code>${escapeHtml(otp)}</code> 👈

⏱️ <b>Válido por 5 minutos.</b>
🛡️ <i>Si no reconoces este intento de autenticación, verifica de inmediato la seguridad de tu contraseña maestra.</i>
  `.trim()

  const payload: TelegramSendMessagePayload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })

    const body: TelegramApiResponse<TelegramMessageResult> = await response.json()

    if (!response.ok || !body.ok) {
      const errorMsg = `[telegram:error] HTTP ${response.status}: ${body.description || 'Unknown Telegram API error'}`
      console.error(errorMsg, { errorCode: body.error_code })
      return { success: false, error: errorMsg }
    }

    console.info(`[telegram:otp:success] 2FA OTP dispatched to group. Msg ID: ${body.result?.message_id}`)

    return {
      success: true,
      messageId: body.result?.message_id,
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const errorMsg = isTimeout
      ? `[telegram:timeout] OTP dispatch exceeded ${DISPATCH_TIMEOUT_MS}ms timeout`
      : `[telegram:exception] Network error: ${error instanceof Error ? error.message : String(error)}`

    console.error(errorMsg)
    return { success: false, error: errorMsg }
  } finally {
    clearTimeout(timeoutId)
  }
}
