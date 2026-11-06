import { axiosApi } from "@/lib/axios"




export const deleteCalenderData = async(roomTypeId:string, data:any)=>{
    const res = await axiosApi.delete(`/availability/${roomTypeId}/calendar`, 
        data
      )
    return res.data
}

export const updateCalenderData = async(roomTypeId:string, data:any)=>{
    const res = await axiosApi.patch(`/availability/${roomTypeId}/calendar`, data);
    return res.data
}
export const getCalendersData = async(roomTypeId:string)=>{
    const res = await axiosApi.get(`/availability/${roomTypeId}/calendar`);
    return res.data
}


////////////////////////////////////////////////
export const getHotelRommTypes = async(hotelId:string)=>{
    const res = await axiosApi.get(`/availability/${hotelId}/room-types`);
    return res.data
}