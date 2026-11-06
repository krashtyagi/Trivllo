import React, { Suspense } from 'react'
import { FinancialDashboard } from './upperhalf'
import { ExpensesDataTable } from './table'
import { ErrorBoundary } from 'react-error-boundary'
import { MessageModal } from '../../(categories)/rooms/_components/RoomsListing'
import { PageSkeleton } from '../../(categories)/rooms/_components/details.skeleton'
// import ExpensesTable from './table'

type Props = {}

const Expense = (props: Props) => {
  return (<ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
    <Suspense fallback={<PageSkeleton />}>
      <div className='flex flex-col gap-4'><FinancialDashboard /><ExpensesDataTable /></div>
    </Suspense>
  </ErrorBoundary>
  )
}

export default Expense