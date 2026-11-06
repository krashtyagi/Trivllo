import React from 'react'
// import { Spinner } from '../spinner'
import { cn } from '@/lib/utils'
import { Spinner } from '../spinner'

type LoaderProps = {
  loading: boolean
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  created?: boolean
}

export const Loader = ({
  loading,
  children,
  className,
}: LoaderProps) => {
  
  return loading ? (
    <div className={cn(className || 'w-full py-5 flex justify-center')}>
      <Spinner/>
    </div>
  ) : (
    children
  )
}