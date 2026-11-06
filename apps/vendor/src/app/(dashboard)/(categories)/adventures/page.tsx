'use client'
import React, { Suspense } from 'react'

import { ErrorBoundary } from 'react-error-boundary'
import { PageSkeleton } from '../rooms/_components/details.skeleton'
import { MessageModal } from '../rooms/_components/RoomsListing'
import { AdventuresListing } from './_components/adventuresListing'

type Props = {}

const page = (props: Props) => {
     return (
          <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
               <Suspense fallback={<PageSkeleton />}>
                    <AdventuresListing />
               </Suspense>
          </ErrorBoundary>
     )
}

export default page