import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

type Props = {
    className?: string
}

const LOGO = (props: Props) => {
    const navigate = useRouter()
    const pathname = usePathname()
    return (
        <div className={cn("h-12 w-[120px] p-2 rounded-full transition hover:scale-105", props.className)} onClick={() => pathname !== '/dashboard' && navigate.push('/dashboard')}>
            <img
                src="/logo.png"
                alt="Company logo"
                className="w-full h-full object-contain"
            />
        </div>
    )
}

export default LOGO