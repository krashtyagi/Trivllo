import { z } from "zod";

export const NewCabSchema = z
  .object({
    cabId: z.string(),
    title: z.string().min(1, "Title is required"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    dropLocation: z.string().min(1, "Drop location is required"),
    carName: z.string().min(1, "Car name is required"),
    cabType: z.string().min(1, "Cab type is required"),
    capacity: z.number().min(1, "Capacity is required"),
    carNumber: z.string().min(1, "Car number is required"),
    images: z.array(
      z.object({
        url: z.string(),
        public_id: z.string(),
        resource_type: z.string(),
      }),
    ).min(5, "At least 5 images are required"),
    description: z.string().min(1, "Description is required"),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    meta: z.object({
      distance: z.string().min(1, "Distance is required"),
      duration: z.string().min(1, "Duration is required"),
    }),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

export type NewCabProps = z.infer<typeof NewCabSchema>;
