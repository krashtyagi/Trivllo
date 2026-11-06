'use client'
import { toast } from "sonner"
import { getCalendersData, getHotelRommTypes } from "./fetch.service"
import { useQuery } from "@tanstack/react-query"
import { useCurrentUser } from "@/services/queryes"

export const useGetCalender = (roomTypeId:string) => {
    
    return useQuery({
        queryKey: ["get-calender", roomTypeId],
        queryFn: () => getCalendersData(roomTypeId),
        staleTime: 10000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: false
    })
}
export const useGetRoomTypes = () => {
    const { data: user } = useCurrentUser();
      const hotelId = user?.data?.approvedData?.hotelId;
    return useQuery({
        queryKey: ["get-room-types", hotelId],
        queryFn: () => getHotelRommTypes(hotelId),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: false,
        enabled:!!hotelId
    })
}