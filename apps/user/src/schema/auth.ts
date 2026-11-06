import { z } from "zod";

export const LoginScshema = z.object({
  email: z.string().email({ message: "Incorrect email format" }),

  password: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" })
    .max(64, {
      message: "Your password can not be longer then 64 characters long",
    })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
      "password should contain only alphabets and numbers",
    ),
});

export type LoginFormProps = z.infer<typeof LoginScshema>;

export const SignUpSchema = z
  .object({
    email: z.string().email({ message: "Incorrect email format" }),

    password: z
      .string()
      .min(4, { message: "Your password must be atleast 4 characters long" })
      .max(64, {
        message: "Your password can not be longer then 64 characters long",
      })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
        "password should contain only alphabets and numbers",
      ),
    confirmPassword: z
      .string()
      .min(4, { message: "Your password must be atleast 4 characters long" }),
    otp: z.string().min(4, { message: "You must enter a 4 digit code" }),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpProps = z.infer<typeof SignUpSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Incorrect email format" }),
  password: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" })
    .max(64, {
      message: "Your password can not be longer then 64 characters long",
    })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
      "password should contain only alphabets and numbers",
    ),
  confirmPassword: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" }),

  otp: z.string().min(4, { message: "You must enter a 4 digit code" }),
});

export type ResetPasswordProps = z.infer<typeof ResetPasswordSchema>;

