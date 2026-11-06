'use client'

import Image from 'next/image'
import { cn } from "@/lib/utils" // if you have classnames helper
import React from 'react'

interface LogoLoaderProps {
  className?: string
  size?: number // in pixels
}

export default function LogoLoader({ className, size = 80 }: LogoLoaderProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-3">
        <div className="animate-float">
          <Image
            src="/logo.png"
            alt="Loading..."
            width={size}
            height={size}
            priority
            className="drop-shadow-xl"
          />
        </div>

        <div className="absolute inset-[-20%] rounded-full border-border border animate-ping-slow" />
      </div>
    </div>
  )
}

