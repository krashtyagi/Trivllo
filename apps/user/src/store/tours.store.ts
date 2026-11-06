import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DateRange } from "react-day-picker";

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
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  status: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  phone: string;
  createdAt: string;
}

type Guests = {
  adults: number;
  children: number;
};

// ... (rest of the code remains the same)
type ToursStoreProps = {
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

export const useToursStore = create<ToursStoreProps>()(
  persist(
    (set) => ({
      payments: {} as Payment,
      city: "Rishikesh",
      wrap: false,

      guests: {
        adults: 1,
        children: 0,
      },

      selectedRoom: null,

      date: undefined,
      isBookingMode: false,

      setWrap: (wrap) => set({ wrap }),
      setCity: (city) => set({ city: city }),
      setPayments: (payments: Payment) => set({ payments }),

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
      name: "tours-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys
      partialize: (state) => ({
        City: state.city,
        date: state.date,
        guests: state.guests,
      }),
    },
  ),
);
