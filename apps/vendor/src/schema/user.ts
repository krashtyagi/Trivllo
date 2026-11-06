import { z } from "zod";

export const UserUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  zipcCode: z.string().optional(),
  avatar: z.string().optional(),
});

export type UserUpdateProps = z.infer<typeof UserUpdateSchema>;
