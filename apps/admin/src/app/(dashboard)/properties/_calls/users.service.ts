import { axiosApi } from "@/lib/axios"

export const property = (params?: any)=>{
    const res = axiosApi.get('/admin/property', { params })
    return res
}
