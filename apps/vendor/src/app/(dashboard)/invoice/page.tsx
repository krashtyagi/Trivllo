'use client'
import React, { Suspense } from 'react'
import { InvoiceTbale } from './invoicetable'
import { MultiServiceInvoiceTable } from './MultiServiceInvoiceTable'
import { ErrorBoundary } from 'react-error-boundary'
import { MessageModal } from '../(categories)/rooms/_components/RoomsListing'
import { PageSkeleton } from '../(categories)/rooms/_components/details.skeleton'
import { useCurrentUser } from '@/services/queryes'

type Props = {}

const Invoice = (props: Props) => {
  const { data, isLoading } = useCurrentUser()
  const cat = data?.data?.vendor?.serviceType

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
      <Suspense fallback={<PageSkeleton />}>
        {cat === "hotel" && <div><InvoiceTbale /></div>}
        {(cat === "tour" || cat === "adventure" || cat === "bike" || cat === "cab") && (
          <div className="p-1 sm:p-3 md:p-6">
            <MultiServiceInvoiceTable />
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default Invoice
