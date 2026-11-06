'use client'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MessageModal } from '../(categories)/rooms/_components/RoomsListing'
import { PageSkeleton } from '../(categories)/rooms/_components/details.skeleton'
import { GuestDataTable } from './_components/datatable'
import { MultiServiceReservationsTable } from './_components/MultiServiceReservations'
import { useCurrentUser } from '@/services/queryes'

type Props = {}

const Page = (props: Props) => {
    const { data, isLoading } = useCurrentUser()
    const cat = data?.data?.vendor?.serviceType

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
            <Suspense fallback={<PageSkeleton />}>
                {cat === "hotel" && <div><GuestDataTable /></div>}
                {(cat === "tour" || cat === "adventure" || cat === "bike" || cat === "cab") && (
                    <div className="p-1 sm:p-3 md:p-6">
                        <MultiServiceReservationsTable />
                    </div>
                )}
            </Suspense>
        </ErrorBoundary>
    )
}

export default Page