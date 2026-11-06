import { CreateHotelBookingSchema } from "@repo/types";
import { Booking, Hotel, RoomType, Payment } from "@repo/database";
import {
  authProcedure,
  vendorProcedure,
  ORPCError,
} from "../server/procedures";
import { z } from "zod";

export const bookingRouter = {
  // User: Create booking
  createBooking: authProcedure
    .input(CreateHotelBookingSchema)
    .mutation(async ({ input, ctx }) => {
      const roomType = await RoomType.findById(input.roomTypeId);
      if (!roomType) throw new ORPCError("Room type not found", "NOT_FOUND");

      const checkIn = new Date(input.checkInDate);
      const checkOut = new Date(input.checkOutDate);
      const nights = Math.max(
        1,
        Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      const totalAmount = roomType.basePrice * input.numberOfRooms * nights;

      const booking = await Booking.create({
        userId: ctx.user.id,
        hotelId: input.hotelId,
        roomTypeId: input.roomTypeId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfRooms: input.numberOfRooms,
        guests: input.guests,
        primaryGuest: input.primaryGuest,
        specialRequests: input.specialRequests,
        totalAmount,
        status: "pending",
      });

      return {
        success: true,
        bookingId: booking._id,
        totalAmount,
        nights,
      };
    }),

  // User: Get my bookings
  getMyBookings: authProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const query: Record<string, any> = { userId: ctx.user.id };
      if (input.status) query.status = input.status;

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .populate("hotelId", "name address images")
        .populate("roomTypeId", "name basePrice")
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        bookings,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Vendor: Get vendor property bookings
  getVendorBookings: vendorProcedure
    .input(
      z.object({
        hotelId: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      const query: Record<string, any> = {};
      if (input.hotelId) {
        query.hotelId = input.hotelId;
      }

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .populate("userId", "firstName lastName email phoneNumber")
        .populate("roomTypeId", "name")
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        bookings,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // User/Vendor: Cancel booking
  cancelBooking: authProcedure
    .input(
      z.object({
        bookingId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const booking = await Booking.findById(input.bookingId);
      if (!booking) throw new ORPCError("Booking not found", "NOT_FOUND");

      // Verify ownership
      if (
        booking.userId?.toString() !== ctx.user.id &&
        ctx.user.role !== "admin"
      ) {
        throw new ORPCError(
          "Not authorized to cancel this booking",
          "FORBIDDEN",
        );
      }

      booking.status = "cancelled";
      booking.cancellationReason = input.reason;
      booking.cancelledAt = new Date();
      await booking.save();

      return { success: true, bookingId: booking._id };
    }),
};
