import { axiosApi } from "@/lib/axios"

/////////////////////////////////////////////////////////////////////////////////////////////////property

export const adminProperty = ()=>{
    const res = axiosApi.get('/admin/property')
    return res
}

export const adminPropertyApprove = (id: string)=>{
    const res = axiosApi.patch(`/admin/property/${id}/approve`)
    return res
}


export const getVendorProposel = (id: string)=>{
    const res = axiosApi.get(`/admin/property/${id}`)
    return res
}

/////////////////////////////////////////////////////////////////////////////////////////////////bookings
//TODO first
//TODO remove dollar
export const BookingsById = (id:string)=>{
    const res = axiosApi.get(`/admin/bookings/${id}`)
    return res
}
export const getStsts = ()=>{
    const res = axiosApi.get(`/admin/bookings/stats`)
    return res
}
export const BookingByParams = (params: {
    search?: string
    status?: string
    page?: number
    paymentStatus:string
    limit?: number
})=>{
    const res = axiosApi.get(`/admin/bookings`, { params })
    return res
}

/////////////////////////////////////////////////////////////////////////////////////////////////reviews
export const adminReviewsFlog = (id: string)=>{
    const res = axiosApi.patch(`/admin/reviews/${id}/flag`)
    return res
}
export const adminReviewsDelete = (id: string)=>{
    const res = axiosApi.delete(`/admin/reviews/${id}`)
    return res
}
export const adminReviews = ()=>{
    const res = axiosApi.get(`/admin/reviews`)
    return res
}
export const adminReviewsByid = (id:string)=>{
    const res = axiosApi.get(`/admin/reviews/${id}`)
    return res
}
export const getReviewsStats = ()=>{
    const res = axiosApi.get(`/admin/reviews/stats`)
    return res
}
/////////////////////////////////////////////////////////////////////////////////////////////////
export const changeStatusUsers = (id:string)=>{
    const res = axiosApi.patch(`/admin/users/${id}/status`)
    return res
}
export const usersBookingStatus = (id:string, booking:string)=>{
    const res = axiosApi.get(`/admin/users/${id}/bookings/${booking}`)
    return res
}
export const usersBookingDetails = (id:string)=>{
    const res = axiosApi.get(`/admin/users/${id}/bookings}`)
    return res
}
export const users = ()=>{
    const res = axiosApi.get(`/admin/users}`)
    return res
}