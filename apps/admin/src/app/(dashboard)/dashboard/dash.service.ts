import { axiosApi } from "@/lib/axios"

export const adminDashboard = ()=>{
    const res = axiosApi.get('/admin/dashboard')
    return res
}
export const recentBookings = ()=>{
    const res = axiosApi.get('/admin/dashboard/recent-bookings')
    return res
}