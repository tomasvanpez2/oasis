/**
 * Telegram Bot API Notification Service
 * Dispatches real-time, structured operational notifications to the factory group.
 * Strictly details the order, total amount in COP, and strategic BI category.
 */
import type { Order, TelegramApiResponse, TelegramSendMessagePayload } from '@/types'
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

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Builds a clean, high-impact HTML notification for factory floor operations.
 */
function buildFactoryOrderMessage(order: Order): string {
  const statusEmoji: Record<string, string> = {
    approved: '✅ PAGO APROBADO EN WOMPI',
    declined: '❌ PAGO DECLINADO',
    pending: '⏳ TRANSACCIÓN PENDIENTE',
    voided: '🚫 PAGO ANULADO',
    error: '⚠️ ERROR EN TRANSACCIÓN',
  }

  const statusHeader = statusEmoji[order.status] || `📋 ESTADO: ${order.status.toUpperCase()}`

  // Product breakdown
  const itemsBreakdown = order.items
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
    order.shipping === 0
      ? '🚛 <i>Envío: Flete directo de fábrica a liquidar por separado</i>'
      : `🚛 <i>Envío: ${formatCOP(order.shipping)}</i>`

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

  const rawPhone = order.customer.phone || ''
  const sanitizedTel = rawPhone.replace(/[^0-9+]/g, '')

  return `
🛏️ <b>OASIS COLCHONES — ORDEN DE PRODUCCIÓN</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>${statusHeader}</b>

📊 <b>CATEGORÍA BI:</b> <code>${order.biCategory}</code>
📋 <b>Referencia:</b> <code>${escapeHtml(order.wompiReference)}</code>
${order.wompiTransactionId ? `🔗 <b>ID Wompi:</b> <code>${escapeHtml(order.wompiTransactionId)}</code>\n` : ''}📅 <b>Fecha (Col):</b> ${dateBogota}

👤 <b>DATOS DE FACTURACIÓN Y DESPACHO</b>
• <b>Cliente:</b> ${escapeHtml(order.customer.fullName)}
• <b>Documento:</b> ${escapeHtml(order.customer.documentType)} ${escapeHtml(order.customer.document)}
• <b>Teléfono:</b> <a href="tel:${sanitizedTel}">${escapeHtml(rawPhone)}</a>
• <b>Email:</b> ${escapeHtml(order.customer.email)}
• <b>Ciudad:</b> ${escapeHtml(order.customer.city)}
• <b>Dirección:</b> ${escapeHtml(order.customer.address)}
${order.customer.notes ? `• <b>Notas de entrega:</b> <i>${escapeHtml(order.customer.notes)}</i>\n` : ''}
🛒 <b>DETALLE DE PRODUCTOS</b>
${itemsBreakdown}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>LIQUIDACIÓN FINANCIERA</b>
• Subtotal: ${formatCOP(order.subtotal)}
• ${shippingNote}
• <b>TOTAL PAGADO: ${formatCOP(order.total)} COP</b>
• <b>Método:</b> ${escapeHtml(order.wompiPaymentMethod || 'Wompi Web Checkout Seguro')}
`.trim()
}

/**
 * Sends an automated, formatted Telegram notification to the factory group.
 * Validates environment variables, enforces request timeout, and parses typed Telegram response.
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
