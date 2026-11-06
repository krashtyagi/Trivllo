import { axiosApi } from "@/lib/axios"

export const adminUsers = (params?: any)=>{
    const res = axiosApi.get('/admin/users' , {params})
    return res
}
export const singleUser = (id:string)=>{
    const res = axiosApi.get(`/admin/users/${id}/bookings` )
    return res
}
export const getUserProfile = (id: string) => {
    return axiosApi.get(`/admin/users/${id}`);
};
export const getDestination = ({id , booking}:{
    id:string, booking:string
})=>{
    const res = axiosApi.get(`/admin/users/${id}/bookings/${booking}` )
    return res
}
export const updateUserStatus = (userId: string, isActive: boolean) => {
    const res = axiosApi.patch(`/admin/users/${userId}/status`, { isActive });
    return res;
};