import { z } from "zod";

export const NewTourSchema = z
  .object({
    tourId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    destinations: z
      .array(z.string().min(1, "Destination cannot be empty"))
      .min(1, "At least one destination is required"),
    duration: z.object({
      days: z.number().min(1, "Days is required"),
      nights: z.number().min(0, "Nights is required"),
    }),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    description: z.string().min(1, "Description is required"),
    features: z.array(z.string()),
    tourType: z.array(z.string()),
    amenities: z.array(z.string()),
    images: z.array(
      z.object({
        url: z.string(),
        public_id: z.string(),
        resource_type: z.string(),
      }),
    ).min(5, "At least 5 images are required"),
    itinerary: z
      .array(
        z.object({
          day: z.number().min(1, "Day number is required"),
          title: z.string().min(1, "Day title is required"),
          description: z.string().min(1, "Day description is required"),
          highlights: z
            .array(z.string().min(1, "Highlight cannot be empty"))
            .min(1, "At least one highlight is required"),
        }),
      )
      .min(1, "At least one itinerary day is required"),
    meta: z.object({
      hotelType: z.string().min(1, "Hotel type is required"),
      transport: z.string().min(1, "Transport is required"),
      mealPlan: z.string().min(1, "Meal plan is required"),
    }),
    maxPeople: z.number().min(1, "Max people is required"),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

export type NewTourProps = z.infer<typeof NewTourSchema>;
