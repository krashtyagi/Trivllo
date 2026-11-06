import { axiosApi } from "@/lib/axios"

export const TogglePatchStatus = {
    checkin:(id:string)=>CheckIn(id),
    checkout:(id:string, forceEarlyCheckout: boolean = false)=>CheckOut(id, forceEarlyCheckout),
    staying:(id:string)=>Staying(id)
}
export const CheckIn = (id:string)=>{
    const res = axiosApi.patch(`/vendors/bookings/${id}/check-in`);
    return res;
}
export const CheckOut = (id:string, forceEarlyCheckout: boolean = false)=>{
    const res = axiosApi.patch(`/vendors/bookings/${id}/check-out`, { forceEarlyCheckout });
    return res;
}
export const Staying = (id:string)=>{
    const res = axiosApi.patch(`/vendors/bookings/${id}/staying`);
    return res;
}