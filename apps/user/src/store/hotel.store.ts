// import { create } from "zustand";
// import type { DateRange } from "react-day-picker";

// type HotelContextStoreProps = {
//   city: string;
//   date: DateRange | undefined;
//   checkIn: DateRange | undefined;
//   wrap: boolean;
//   booking: boolean;
//   hotel: {
//     id: string;
//     image: string;
//     name: string;
//     rating: number;
//     price: number;
//     reviewCount: number;
//     totalPrice: number;
//   };

//   guests: {
//     adults: number;
//     children: number;
//   };

//   setCity: (city: string) => void;
//   setDate: (date: DateRange | undefined) => void;
//   setCheckIn: (checkIn: DateRange | undefined) => void;
//   setWrap: (wrap: boolean) => void;
//   setBooking: (booking: boolean) => void;

//   setGuests: (guests: { adults: number; children: number }) => void;
//   setHotel: (hotel: {
//     id: string;
//     image: string;
//     name: string;
//     rating: number;
//     price: number;
//     reviewCount: number;
//     totalPrice: number;
//   }) => void;
// };

// export const useHotelStore = create<HotelContextStoreProps>((set) => ({
//   city: "Goa",
//   hotel: {
//     id: "",
//     image: "/img4.png",
//     name: "Hotel Arts Barcelona",
//     rating: 5,
//     reviewCount: 1260,
//     price: 100,
//     totalPrice: 1450,
//   },

//   date: {
//     from: new Date(2025, 5, 12),
//     to: new Date(2025, 6, 15),
//   },

//   guests: {
//     adults: 0,
//     children: 0,
//   },

//   checkIn: {
//     from: new Date(2025, 5, 12),
//     to: new Date(2025, 6, 15),
//   },

//   wrap: false,
//   booking: true,

//   setCity: (city) => set({ city }),
//   setDate: (date) => set({ date }),
//   setCheckIn: (checkIn) => set({ checkIn }),
//   setWrap: (wrap) => set({ wrap }),
//   setBooking: (booking) => set({ booking }),
//   setGuests: (guests) => set({ guests }),
//   setHotel: (hotel) => set({ hotel }),
// }));

// import { create } from "zustand";
// import type { DateRange } from "react-day-picker";

// type SelectedRoom = {
//   hotelId: string;
//   roomTypeId: string;
//   title: string;
//   image: string;
//   pricePerNight: number;
//   totalPrice: number;
//   nights: number;
// } | null;

// type HotelStoreProps = {
//   city: string;
//   date: DateRange | undefined;

//   guests: {
//     adults: number;
//     children: number;
//   };

//   selectedRoom: SelectedRoom;

//   setCity: (city: string) => void;
//   setDate: (date: DateRange | undefined) => void;
//   setGuests: (guests: { adults: number; children: number }) => void;

//   setSelectedRoom: (room: SelectedRoom) => void;
//   clearSelectedRoom: () => void;
// };

// export const useHotelStore = create<HotelStoreProps>((set) => ({
//   city: "Goa",

//   date: undefined,

//   guests: {
//     adults: 1, // minimum valid default
//     children: 0,
//   },

//   selectedRoom: null,

//   setCity: (city) => set({ city }),

//   setDate: (date) => set({ date }),

//   setGuests: (guests) => set({ guests }),

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DateRange } from "react-day-picker";
// import { Payment } from "@/app/(personal)/book/[[...slug]]/_components/paymentform";

type SelectedRoom = {
  hotelId: string;
  roomTypeId: string;
  title: string;
  image: string;
  pricePerNight: number;
  taxPercentage: number;
  totalTax: number;
  totalPriceWithTax: number;
  totalPrice: number;
  nights: number;
} | null;
export interface Payment {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  amount?: number;
  currency?: string;
  status?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  contact?: string;
  phone?: string;
  createdAt?: string;
  bookingId?: string;
  bookingReference?: string;
  _id?: string;
  [key: string]: any;
}

type Guests = {
  adults: number;
  children: number;
};

// ... (rest of the code remains the same)
type HotelStoreProps = {
  city: string;
  date?: DateRange;
  guests: Guests;
  wrap: boolean;

  selectedRoom: SelectedRoom;
  payments: Payment;

  // Derived
  isBookingMode: boolean;
  setPayments: (payments: Payment) => void;
  setCity: (city: string) => void;
  setDate: (date?: DateRange) => void;
  setGuests: (guests: Guests) => void;
  setWrap: (wrap: boolean) => void;

  setSelectedRoom: (room: SelectedRoom) => void;
  clearSelectedRoom: () => void;
};

export const useHotelStore = create<HotelStoreProps>()(
  persist(
    (set) => ({
      payments: {} as Payment,
      city: "Indore",
      wrap: false,

      guests: {
        adults: 1,
        children: 0,
      },

      selectedRoom: null,

      date: undefined,
      isBookingMode: false,

      setWrap: (wrap) => set({ wrap }),
      setCity: (city) => set({ city }),
      setPayments: (payments: Payment) =>
        set((state) => ({ payments: { ...state.payments, ...payments } })),

      setDate: (date) =>
        set(() => ({
          date,
          isBookingMode: !!date?.from && !!date?.to,
          selectedRoom: null,
        })),

      setGuests: (guests) =>
        set(() => ({
          guests,
          selectedRoom: null, // reset selected room when guests change
        })),

      setSelectedRoom: (room) => set({ selectedRoom: room }),

      clearSelectedRoom: () => set({ selectedRoom: null }),
    }),
    {
      name: "hotel-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys
      partialize: (state) => ({
        city: state.city,
        date: state.date,
        guests: state.guests,
      }),
    },
  ),
);
