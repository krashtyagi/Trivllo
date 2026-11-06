import { z } from "zod";

export const LoginScshema = z.object({
  email: z.email({ message: "Incorrect email format" }),

  password: z
    .string()
    .min(8, { message: "Your password must be atleast 8 characters long" })
    .max(64, {
      message: "Your password can not be longer then 64 characters long",
    }),
  // .refine(
  //   (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
  //   "password should contain only alphabets and numbers",
  // ),
});
const mediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  public_id: z.string().min(1, "Public ID is required"),
  resource_type: z.string(),
});

// Schema for the documents array (slightly different keys than images)
const documentSchema = z.object({
  docName: z.string().min(1, "Document name is required"),
  docUrl: z.string().url("Invalid document URL"),
  public_id: z.string().min(1, "Public ID is required"),
  resource_type: z.string(),
});

// GeoJSON Location Schema
const locationSchema = z.object({
  type: z.string("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});
export type LoginFormProps = z.infer<typeof LoginScshema>;
export const serviceTypeEnum = z.enum([
  "hotel",
  "cab",
  "tour",
  "bike",
  "adventure",
]);
export type serviceTypeEnumProps = z.infer<typeof serviceTypeEnum>;
const RoleEnum = z.enum(["vendor", "customer", "admin"]);
const GenderEnum = z.enum(["male", "female", "other"]);
export const bankProofSchema = z.object({
  url: z.string().url("Invalid bank proof URL"),
  public_id: z.string().min(1, "Public ID is required"),
  resource_type: z.literal("image").or(z.string()), // Using literal if it's always 'image'
});
export const SignUpSchema = z
  .object({
    email: z.string().email("Incorrect email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "..."),
    confirmPassword: z.string(),
    role: RoleEnum,
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    gender: GenderEnum,
    dob: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
    country: z.string().min(2, "Country is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    zipcode: z.string().min(4, "Zipcode is required"),
    otp: z.string().min(4, "OTP must be 4 digits"),

    //step-1
    serviceType: serviceTypeEnum,
    businessName: z.string().min(2, "Business name is required"),
    businessEmail: z.string().email("Invalid email address"),
    businessPhone: z
      .string()
      .regex(/^[0-9]{10}$/, "Must be a valid 10-digit number"),
    businessAddress: z.string().min(5, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    panNumber: z.string().length(10, "PAN must be 10 characters").toUpperCase(),
    aadhaarNumber: z.string().length(12, "Aadhaar must be 12 digits"),
    verificationDocs: z
      .array(
        z.object({
          docName: z.string().min(1, "Document name is required"),
          docUrl: z.string().url("Invalid document URL"),
        }),
      )
      .min(1, "At least one document is required"),

    //step-2
    accountHolderName: z.string().min(2, "Name is too short"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z
      .string()
      .min(9, "Account number too short")
      .max(18, "Account number too long")
      .regex(/^\d+$/, "Account number must contain only digits"),
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
    branchName: z.string().min(1, "Branch name is required"),
    upiId: z
      .string()
      .email("Invalid UPI ID format")
      .optional()
      .or(z.string().regex(/^[\w.-]+@[\w.-]+$/)), // Handles standard user@bank format
    bankProof: bankProofSchema,

    //step-3 hotel & services
    name: z.string().min(3, "Hotel name must be at least 3 characters"),
    description: z.string().min(10, "Description should be more detailed"),
    hotelAddress: z.string().min(1, "Address is required"),
    hotelCity: z.string().min(1, "City is required"),
    location: locationSchema,
    buildingName: z.string().optional(),
    doorNumber: z.string().optional(),
    streetAddress: z.string().optional(),
    areaName: z.string().optional(),
    district: z.string().optional(),
    postalCode: z.string().optional(),
    landmark: z.string().optional(),
    directions: z.string().optional(),
    formattedAddress: z.string().optional(),
    logo: mediaSchema.optional(),
    images: z.array(mediaSchema).min(5, "At least 5 images are required"),
    documents: z
      .array(documentSchema)
      .min(1, "At least one document is required"),
    amenities: z.array(z.string()).min(1, "Please select at least one amenity"),
    adventureCategory: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpProps = z.infer<typeof SignUpSchema>;

// Reusable schema for image/document objects

export const hotelCreateSchema = z.object({
  name: z.string().min(3, "Hotel name must be at least 3 characters"),
  description: z.string().min(10, "Description should be more detailed"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  location: locationSchema,
  images: z.array(mediaSchema).min(5, "At least 5 images are required"),
  documents: z
    .array(documentSchema)
    .min(1, "At least one document is required"),
  amenities: z.array(z.string()).min(1, "Please select at least one amenity"),
});

// Type inference
export type HotelCreatePayload = z.infer<typeof hotelCreateSchema>;

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
