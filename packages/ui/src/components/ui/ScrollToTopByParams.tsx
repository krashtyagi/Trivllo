"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function ScrollToTopByParams() {
    const searchParams = useSearchParams()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [searchParams])

    return null
}