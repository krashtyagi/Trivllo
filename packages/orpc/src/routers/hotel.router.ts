import { HotelPropertySchema } from "@repo/types";
import { Hotel, Room, RoomType } from "@repo/database";
import { publicProcedure, vendorProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const hotelRouter = {
  // Public: Search hotels
  searchHotels: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      starRating: z.number().optional(),
      amenities: z.array(z.string()).optional(),
      page: z.number().int().default(1),
      limit: z.number().int().default(12),
      sortBy: z.enum(["price_asc", "price_desc", "rating_desc", "newest"]).default("newest"),
    }))
    .query(async ({ input }) => {
      const query: Record<string, any> = { status: "approved" };

      if (input.city) {
        query["address.city"] = { $regex: input.city, $options: "i" };
      }
      if (input.minPrice || input.maxPrice) {
        query.basePricePerNight = {};
        if (input.minPrice) query.basePricePerNight.$gte = input.minPrice;
        if (input.maxPrice) query.basePricePerNight.$lte = input.maxPrice;
      }
      if (input.starRating) {
        query.starRating = { $gte: input.starRating };
      }
      if (input.amenities && input.amenities.length > 0) {
        query.amenities = { $all: input.amenities };
      }

      const sortMap: Record<string, any> = {
        price_asc: { basePricePerNight: 1 },
        price_desc: { basePricePerNight: -1 },
        rating_desc: { starRating: -1 },
        newest: { createdAt: -1 },
      };

      const total = await Hotel.countDocuments(query);
      const hotels = await Hotel.find(query)
        .sort(sortMap[input.sortBy] || { createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        hotels,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Public: Hotel Detail with Room Types
  getHotelById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const hotel = await Hotel.findById(input.id).lean();
      if (!hotel) throw new ORPCError("Hotel not found", "NOT_FOUND");

      const roomTypes = await RoomType.find({ hotelId: input.id }).lean();

      return {
        ...hotel,
        roomTypes,
      };
    }),

  // Vendor: Create / Register Hotel Property
  createHotel: vendorProcedure
    .input(HotelPropertySchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const hotel = await Hotel.create({
        ...input,
        vendorId: ctx.user.id,
        verificationStatus: "pending",
      } as any);

      return { success: true, hotel };
    }),

  // Vendor: Get own properties
  getMyProperties: vendorProcedure.query(async ({ ctx }) => {
    return await Hotel.find({ vendorId: ctx.user.id }).lean();
  }),
};

