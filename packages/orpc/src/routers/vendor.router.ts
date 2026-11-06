import { VendorBankAccountSchema } from "@repo/types";
import { Vendor, Bank, Hotel, Booking } from "@repo/database";
import { vendorProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const vendorRouter = {
  // Vendor: Get vendor profile
  getProfile: vendorProcedure.query(async ({ ctx }) => {
    const vendor = await Vendor.findOne({ userId: ctx.user.id }).lean();
    return vendor || null;
  }),

  // Vendor: Update Bank Account
  updateBankAccount: vendorProcedure
    .input(VendorBankAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const bank = await Bank.findOneAndUpdate(
        { userId: ctx.user.id },
        { ...input, userId: ctx.user.id },
        { upsert: true, new: true }
      );

      return { success: true, bankId: bank._id };
    }),

  // Vendor: Quick dashboard stats
  getDashboardStats: vendorProcedure.query(async ({ ctx }) => {
    const properties = await Hotel.find({ vendorId: ctx.user.id }).select("_id").lean();
    const propertyIds = properties.map((p) => p._id);

    const [totalBookings, activeProperties] = await Promise.all([
      Booking.countDocuments({ hotelId: { $in: propertyIds } }),
      Hotel.countDocuments({ vendorId: ctx.user.id, status: "approved" }),
    ]);

    return {
      totalProperties: properties.length,
      activeProperties,
      totalBookings,
    };
  }),
};

