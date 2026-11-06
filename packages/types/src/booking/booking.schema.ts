import { z } from "zod";

export const BookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "refunded",
  "failed"
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const CreateHotelBookingSchema = z.object({
  hotelId: z.string().min(1),
  roomTypeId: z.string().min(1),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  numberOfRooms: z.number().int().min(1).default(1),
  guests: z.object({
    adults: z.number().int().min(1).default(1),
    children: z.number().int().min(0).default(0),
  }),
  primaryGuest: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  specialRequests: z.string().max(500).optional(),
});
export type CreateHotelBookingInput = z.infer<typeof CreateHotelBookingSchema>;

