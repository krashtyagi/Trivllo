import { z } from "zod";

const imageSchema = z.object({
  url: z.string(),
  public_id: z.string(),
  resource_type: z.string(),
});

const itinerarySchema = z.object({
  day: z.number().min(1, "Day number is required"),
  title: z.string().min(1, "Day title is required"),
  description: z.string().min(1, "Day description is required"),
});

// ── Distance type (Rafting) ──────────────────────────────
export const DistanceServiceSchema = z
  .object({
    adventureId: z.string().min(1, "Adventure ID is required"),
    title: z.string().min(1, "Title is required"),
    type: z.literal("distance"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    meta: z.object({
      distance: z.string().min(1, "Distance is required"),
      duration: z.string().min(1, "Duration is required"),
    }),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    images: z.array(imageSchema).min(5, "At least 5 images are required"),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

// ── Time type (Paragliding) ─────────────────────────────
export const TimeServiceSchema = z
  .object({
    adventureId: z.string().min(1, "Adventure ID is required"),
    title: z.string().min(1, "Title is required"),
    type: z.literal("time"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    meta: z.object({
      duration: z.string().min(1, "Duration is required"),
    }),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    images: z.array(imageSchema).min(5, "At least 5 images are required"),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

// ── Fixed type (Bungee Jumping) ─────────────────────────
export const FixedServiceSchema = z
  .object({
    adventureId: z.string().min(1, "Adventure ID is required"),
    title: z.string().min(1, "Title is required"),
    type: z.literal("fixed"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    images: z.array(imageSchema).min(5, "At least 5 images are required"),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

// ── Package type (Trekking) ─────────────────────────────
export const PackageServiceSchema = z
  .object({
    adventureId: z.string().min(1, "Adventure ID is required"),
    title: z.string().min(1, "Title is required"),
    type: z.literal("package"),
    basePrice: z.number().min(1, "Base price is required"),
    discountPrice: z.number().min(0, "Discount price is required"),
    meta: z.object({
      days: z.number().min(1, "Days is required"),
      nights: z.number().min(0, "Nights is required"),
    }),
    features: z.array(z.string()).min(1, "At least one feature is required"),
    images: z.array(imageSchema).min(5, "At least 5 images are required"),
    itinerary: z
      .array(itinerarySchema)
      .min(1, "At least one itinerary day is required"),
  })
  .refine((data) => data.discountPrice < data.basePrice, {
    message: "Discount price must be less than base price",
    path: ["discountPrice"],
  });

export type DistanceServiceProps = z.infer<typeof DistanceServiceSchema>;
export type TimeServiceProps = z.infer<typeof TimeServiceSchema>;
export type FixedServiceProps = z.infer<typeof FixedServiceSchema>;
export type PackageServiceProps = z.infer<typeof PackageServiceSchema>;

export type ServiceType = "distance" | "time" | "fixed" | "package";
