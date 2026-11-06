import z from "zod";

export const PaymentSchema = z.object({
  dates: z.object({
    checkin: z.string(),
    checkout: z.string(),
  }),
  guests: z.object({
    adults: z.number(),
    children: z.number(),
  }),
  guestInformation: z.array(
    z.object({
      firstname: z
        .string()
        .min(1, "First name is required")
        .regex(/^[A-Za-z\s.'-]+$/, "Only letters and spaces are allowed"),

      lastname: z
        .string()
        .min(1, "Last name is required")
        .regex(/^[A-Za-z\s.'-]+$/, "Only letters and spaces are allowed"),
      email: z.string().email("Invalid email").or(z.literal("")),
      phone: z.string().optional().or(z.literal("")),
    }),
  ),
  specialRequest: z.string(),

  rooms: z.array(
    z.object({
      room: z.string(),
    }),
  ),
});

export type PaymentProps = z.infer<typeof PaymentSchema>;
