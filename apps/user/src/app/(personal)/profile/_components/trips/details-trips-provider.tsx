// 'use client'
// import { useBookingByIdQuery } from '@/services/hotel/querys';
// import React, { createContext, useContext } from 'react'

// type Props = {
//     children: React.ReactNode,
//     id: string
// }
export interface BookingDetails {
    _id: string,
    bookingReference: string,
    checkIn: string,
    checkOut: string,
    guests: {
        adults: number,
        children: number,

    },
    hotel: {
        hotelId:string,
        address: string,
        name: string,
        coordinates: number[],
        thumbnail: string,
    },
    nights: number,
    paymentStatus: string,
    priceBreakdown: {
        cleaningFee: number,
        discountAmount: number,
        pricePerNight: number,
        taxAmount: number,
        totalAmount: number,
    },
    status: string,


    roomsBooked: number

    room: {
        amenities: string[],
        roomSizeSqm: number,
        name: string,

    }

}
// type DetailsTripsProviderProps = {
//     bookings: BookingDetails[],
//     id: string
// }
// const DetailsTripsContext = createContext<DetailsTripsProviderProps | null>(null);
// const DetailsTripsProvider = (props: Props) => {
//     const { data: booking } = useBookingByIdQuery({ id: props.id });
//     return (
//         <DetailsTripsContext.Provider value={booking}>
//             {props.children}
//         </DetailsTripsContext.Provider>
//     )
// }

// export default DetailsTripsProvider

// export const useDetailsTrips = () => {
//     const context = useContext(DetailsTripsContext);
//     if (!context) {
//         throw new Error("useDetailsTrips must be used within a DetailsTripsProvider");
//     }
//     return context;
// };
