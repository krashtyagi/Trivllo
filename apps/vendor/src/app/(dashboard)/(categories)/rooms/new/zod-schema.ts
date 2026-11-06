import { z } from "zod";

export const NewRoomSchema = z
  .object({
    hotelId: z.string().min(1, "Hotel is required"), //
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    capacity: z.object({
      adults: z.number().min(1, "Adults is required"),
      children: z.number(),
    }),

    beds: z
      .array(
        z.object({
          type: z.string(),
          quantity: z.number().min(1, "Quantity is required"),
        }),
      )
      .min(1, "Beds are required"),
    amenities: z.array(z.string()).min(1, "Amenities are required"),
    roomSizeSqm: z.number().min(1, "Room size is required"),
    viewType: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        public_id: z.string(),
        resource_type: z.string(),
      }),
    ).min(5, "At least 5 images are required"),
    totalRooms: z.number().min(1, "Total rooms is required"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      const discount = Number(data.discountPrice || 0);
      const base = Number(data.basePrice || 0);
      if (discount === 0) return true;
      return discount <= base;
    },
    {
      message: "Discounted price cannot be greater than base price",
      path: ["discountPrice"],
    }
  );

export type NewRoomProps = z.infer<typeof NewRoomSchema>;
