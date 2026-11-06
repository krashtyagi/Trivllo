import React, { Suspense } from 'react'
import ChatDashboard from './_components/messages'
import { ErrorBoundary } from 'react-error-boundary'
import { MessageModal } from '../(categories)/rooms/_components/RoomsListing'
import { PageSkeleton } from '../(categories)/rooms/_components/details.skeleton'
import { Verify } from '@/app/(auth)/authMiddleware'

type Props = {}

const page = (props: Props) => {
     return (
          <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
               <Suspense fallback={<PageSkeleton />}>
                    <div><ChatDashboard /></div>
               </Suspense>
          </ErrorBoundary>
     )
}

export default page