import { cn } from '@/lib/utils'
import React from 'react'


const FrameColursals = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("flex flex-col gap-y-2 md:gap-y-4 w-full", className)}>
            {children}
        </div>
    )
}

export default FrameColursals