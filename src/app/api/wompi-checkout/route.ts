import { NextRequest, NextResponse } from 'next/server'
import { createTransaction } from '@/lib/wompi'
import { saveOrder, updateOrderStatus } from '@/lib/blob'
import { generateOrderReference } from '@/lib/utils'
import { sendOrderNotification } from '@/lib/telegram'
import type { Order, WompiTransactionRequest } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, subtotal, shipping = 0, total, cardToken, installments = 1, paymentMethodType = 'CARD' } = body

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.document || !items || !items.length) {
      return NextResponse.json(
        { error: 'Información incompleta para registrar y procesar la orden' },
        { status: 400 }
      )
    }

    const calculatedTotal = total || subtotal + shipping
    const reference = generateOrderReference()

    // Create order with pending status
    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      wompiReference: reference,
      status: 'pending',
      customer,
      items,
      subtotal,
      shipping,
      total: calculatedTotal,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wompiPaymentMethod: paymentMethodType,
    }

    // Persist to Vercel Blob (or local .data file fallback)
    await saveOrder(order)

    // Build Wompi transaction payload
    const transactionPayload: WompiTransactionRequest = {
      amount_in_cents: calculatedTotal * 100, // Centavos COP
      currency: 'COP',
      customer_email: customer.email,
      reference,
      payment_method: {
        type: paymentMethodType === 'CARD' ? 'CARD' : 'NEQUI',
        token: cardToken || `tok_test_${Date.now()}`,
        installments: Number(installments) || 1,
      },
      customer_data: {
        phone_number: customer.phone,
        full_name: customer.fullName,
        legal_id: customer.document,
        legal_id_type: customer.documentType || 'CC',
      },
      shipping_address: {
        address_line_1: customer.address,
        city: customer.city,
        region: 'CO',
        name: customer.fullName,
        phone_number: customer.phone,
        country: 'CO',
      },
    }

    // Process transaction via Wompi service
    const transaction = await createTransaction(transactionPayload)

    const finalStatus =
      transaction.status === 'APPROVED'
        ? 'approved'
        : transaction.status === 'DECLINED'
        ? 'declined'
        : transaction.status === 'ERROR'
        ? 'error'
        : 'pending'

    // Update order status in database
    const updatedOrder = await updateOrderStatus(reference, finalStatus, transaction.id, {
      wompiStatus: transaction.status,
      paymentMethodType,
      amountInCents: transaction.amount_in_cents,
      processedLocally: process.env.NODE_ENV !== 'production',
    })

    const finalizedOrder = updatedOrder || { ...order, status: finalStatus, wompiTransactionId: transaction.id }

    // If order was approved immediately, send Telegram notification if configured
    if (finalStatus === 'approved') {
      try {
        await sendOrderNotification(finalizedOrder)
      } catch (telegramErr) {
        console.warn('[checkout:telegram] Notification failed:', telegramErr)
      }
    }

    return NextResponse.json({
      success: finalStatus === 'approved',
      status: finalStatus,
      reference,
      transactionId: transaction.id,
      order: finalizedOrder,
    })
  } catch (err) {
    console.error('[api/wompi-checkout error]', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Error procesando el pago en el servidor',
      },
      { status: 500 }
    )
  }
}
