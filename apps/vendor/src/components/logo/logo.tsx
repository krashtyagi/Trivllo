import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

type Props = {}

const LOGO = (props: Props) => {
    const navigate = useRouter()
    const pathname = usePathname()
    return (
        <div className="h-12 w-[120px] px-2 rounded-full transition hover:scale-105" onClick={() => pathname !== '/dashboard' && navigate.push('/dashboard')}>
            <img
                src="/logo.png"
                alt="Company logo"
                className="w-full h-full object-contain"
            />
        </div>
    )
}

export default LOGO