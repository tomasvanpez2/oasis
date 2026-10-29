'use client'
import { useSearchParams } from 'next/navigation'
import { SuccessReceipt } from '@/components/checkout/SuccessReceipt'

export function SuccessReceiptWrapper() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || ''
  const transactionId = searchParams.get('id') || searchParams.get('transactionId') || ''

  return <SuccessReceipt reference={reference} transactionId={transactionId} />
}

