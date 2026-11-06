import React, { Suspense } from 'react'

import { ErrorBoundary } from 'react-error-boundary'
import { Verify } from '@/app/(auth)/authMiddleware'
import { PageSkeleton } from '../rooms/_components/details.skeleton'
import { MessageModal, RoomListing } from '../rooms/_components/RoomsListing'
import { CabListing } from './_components/cabListing'

type Props = {}

const page = (props: Props) => {
     return (
          <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
               <Suspense fallback={<PageSkeleton />}>
                    <CabListing />
               </Suspense>
          </ErrorBoundary>
     )
}

export default page