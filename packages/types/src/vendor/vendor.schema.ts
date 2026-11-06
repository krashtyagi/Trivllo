import { z } from "zod";

export const VendorServiceTypeEnum = z.enum(["hotel", "adventure", "bike", "cab", "tour"]);
export type VendorServiceType = z.infer<typeof VendorServiceTypeEnum>;

export const VendorRegistrationStep1Schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  serviceType: VendorServiceTypeEnum,
  contactPerson: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
});

export const VendorRegistrationStep2Schema = z.object({
  gstNumber: z.string().optional(),
  panNumber: z.string().min(10).max(10).optional(),
  businessAddress: z.string().min(10),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6).max(6),
});

export const VendorBankAccountSchema = z.object({
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8).max(20),
  ifscCode: z.string().min(11).max(11),
  bankName: z.string().min(2),
  branch: z.string().optional(),
});
export type VendorBankAccount = z.infer<typeof VendorBankAccountSchema>;

