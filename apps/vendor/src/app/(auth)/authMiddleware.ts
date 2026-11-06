'use client'
import { useCurrentUser } from "@/services/queryes"
import { vendorAccessToken } from "@/services/auth"
import { useEffect } from "react"

export const Verify = () => {
    const { data: user, isLoading } = useCurrentUser()
    useEffect(() => {
        const token = localStorage.getItem(vendorAccessToken) || localStorage.getItem("token")
        if (!isLoading && !token && !user?.data) {
            window.location.href = "/login"
        }
    }, [user, isLoading])
    return true
}