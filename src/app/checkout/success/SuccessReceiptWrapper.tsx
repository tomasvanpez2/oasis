'use client'
import { useSearchParams } from 'next/navigation'
import { SuccessReceipt } from '@/components/checkout/SuccessReceipt'

interface SuccessReceiptWrapperProps {
  initialReference?: string
  initialTransactionId?: string
}

export function SuccessReceiptWrapper({
  initialReference = '',
  initialTransactionId = '',
}: SuccessReceiptWrapperProps) {
  const searchParams = useSearchParams()
  const reference = (searchParams.get('reference') || initialReference || '').trim()
  const transactionId = (
    searchParams.get('id') ||
    searchParams.get('transactionId') ||
    initialTransactionId ||
    ''
  ).trim()

  return <SuccessReceipt reference={reference} transactionId={transactionId} />
}
