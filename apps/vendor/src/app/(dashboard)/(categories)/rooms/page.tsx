import React, { Suspense } from 'react'
import { MessageModal, RoomListing } from './_components/RoomsListing'
import { PageSkeleton } from './_components/details.skeleton'
import { ErrorBoundary } from 'react-error-boundary'
import { Verify } from '@/app/(auth)/authMiddleware'

type Props = {}

const page = (props: Props) => {
     return (
          <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
               <Suspense fallback={<PageSkeleton />}>
                    <RoomListing />
               </Suspense>
          </ErrorBoundary>
     )
}

export default page