import { z } from "zod";

export const UserRoleEnum = z.enum([
  "user",
  "vendor",
  "admin",
  "super_admin",
  "blog_author",
  "blog_editor",
  "seo_manager",
  "reviewer",
  "analyst",
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: UserRoleEnum.default("user"),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const UpdateUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().url().optional(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

