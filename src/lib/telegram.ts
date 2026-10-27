/**
 * Telegram Bot API — order notification utility
 */
import type { Order } from '@/types'
import { formatCOP } from '@/lib/utils'

const TELEGRAM_API = 'https://api.telegram.org'

export async function sendOrderNotification(order: Order): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('[telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID')
    return
  }

  const statusEmoji: Record<string, string> = {
    approved: '✅',
    declined: '❌',
    pending: '⏳',
    voided: '🚫',
    error: '⚠️',
  }

  const itemsText = order.items
    .map(
      (item) =>
        `  • ${item.productName} (${item.size} — ${item.dimensions})\n` +
        `    ${item.quantity}x ${formatCOP(item.price)} = ${formatCOP(item.price * item.quantity)}`
    )
    .join('\n')

  const shippingText =
    order.shipping === 0
      ? '🚛 Envío: A liquidar por separado'
      : `🚛 Envío: ${formatCOP(order.shipping)}`

  const message = `
🛏️ *NUEVA ORDEN — OASIS COLCHONES*
${statusEmoji[order.status] ?? '📋'} Estado: *${order.status.toUpperCase()}*

📋 *Referencia:* \`${order.wompiReference}\`
${order.wompiTransactionId ? `🔗 *ID Wompi:* \`${order.wompiTransactionId}\`` : ''}
📅 *Fecha:* ${new Date(order.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}

👤 *CLIENTE*
Nombre: ${order.customer.fullName}
Email: ${order.customer.email}
Teléfono: ${order.customer.phone}
Documento: ${order.customer.documentType} ${order.customer.document}
Ciudad: ${order.customer.city}
Dirección: ${order.customer.address}
${order.customer.notes ? `Notas: ${order.customer.notes}` : ''}

🛒 *PRODUCTOS*
${itemsText}

💰 *RESUMEN*
Subtotal: ${formatCOP(order.subtotal)}
${shippingText}
*TOTAL: ${formatCOP(order.total)}*

Forma de pago: ${order.wompiPaymentMethod ?? 'Tarjeta'}
`.trim()

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[telegram] Failed to send message:', err)
    }
  } catch (err) {
    console.error('[telegram] Network error:', err)
  }
}
