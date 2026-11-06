'use client'
import React, { Suspense } from 'react'

import { ErrorBoundary } from 'react-error-boundary'
import { Verify } from '@/app/(auth)/authMiddleware'
import { PageSkeleton } from '../rooms/_components/details.skeleton'
import { MessageModal, RoomListing } from '../rooms/_components/RoomsListing'
import { useGetBikesServices } from '@/services/tanstack.query'
import { BikesListing } from './_components/bikesListing'

type Props = {}

const page = (props: Props) => {
     const { data, isLoading } = useGetBikesServices();
     return (
          <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
               <Suspense fallback={<PageSkeleton />}>
                    <BikesListing />
               </Suspense>
          </ErrorBoundary>
     )
}

export default page