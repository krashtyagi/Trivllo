import { z } from "zod";

export const NewBikeSchema = z
  .object({
    bikeId: z.string().min(1, "Bike ID is required"),
    title: z.string().min(1, "Title is required"),
    bikeName: z.string().min(1, "Bike name is required"),
    bikeType: z.string().min(1, "Bike type is required"),
    engineCC: z.number().min(1, "Engine CC is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    pricePerDay: z.number().min(1, "Price per day is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    maxDurationDays: z.number().min(1, "Max duration is required"),
    description: z.string().min(1, "Description is required"),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    images: z.array(
      z.object({
        url: z.string(),
        public_id: z.string(),
        resource_type: z.string(),
      }),
    ).min(5, "At least 5 images are required"),
    meta: z.object({
      mileage: z.string().min(1, "Mileage is required"),
      gearType: z.string().min(1, "Gear type is required"),
    }),
  })
  .refine((data) => data.discountPrice < data.pricePerDay, {
    message: "Discount price must be less than price per day",
    path: ["discountPrice"],
  });

export type NewBikeProps = z.infer<typeof NewBikeSchema>;
