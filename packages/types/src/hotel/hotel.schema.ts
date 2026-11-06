import { z } from "zod";

export const AddressSchema = z.object({
  doorNumber: z.string().optional(),
  buildingName: z.string().optional(),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  areaName: z.string().optional(),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("India"),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }).optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const HotelPropertySchema = z.object({
  id: z.string().optional(),
  vendorId: z.string(),
  name: z.string().min(3),
  description: z.string().min(20),
  propertyType: z.enum(["hotel", "resort", "homestay", "villa", "apartment", "hostel"]).default("hotel"),
  address: AddressSchema,
  images: z.array(z.string().url()).min(1),
  coverImage: z.string().url().optional(),
  amenities: z.array(z.string()).default([]),
  checkInTime: z.string().default("12:00 PM"),
  checkOutTime: z.string().default("11:00 AM"),
  policies: z.array(z.string()).default([]),
  starRating: z.number().min(1).max(5).optional(),
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "paused"]).default("draft"),
  basePricePerNight: z.number().positive().optional(),
});
export type HotelProperty = z.infer<typeof HotelPropertySchema>;

export const RoomTypeSchema = z.object({
  id: z.string().optional(),
  hotelId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  maxGuests: z.number().int().min(1).default(2),
  maxAdults: z.number().int().min(1).default(2),
  maxChildren: z.number().int().min(0).default(0),
  bedType: z.string().default("Queen"),
  numberOfBeds: z.number().int().default(1),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  totalInventory: z.number().int().min(1).default(1),
});
export type RoomType = z.infer<typeof RoomTypeSchema>;

