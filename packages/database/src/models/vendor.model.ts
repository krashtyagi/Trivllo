import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IVendorDoc {
  docName?: string;
  docUrl?: string;
  isVerified?: boolean;
}

export interface IVendorLogo {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IVendor extends Document {
  userId: Types.ObjectId;
  propertyId?: string;
  linkedGroupId?: Types.ObjectId | null;
  activePropertyId?: Types.ObjectId | null;
  serviceType?: "hotel" | "adventure" | "cab" | "bike" | "tour";
  businessName?: string;
  logo?: IVendorLogo;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  verificationDocs: IVendorDoc[];
  status:
    | "draft"
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "blocked";
  registrationStep: number;
  currentStep: number;
  rejectedSteps: number[];
  rejectionReasons: Record<string, string>;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  blockedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  isSubmitted: boolean;
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  blockedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor must be linked to a User account"],
      index: true,
    },

    // Unique 6-digit ID assigned at admin approval
    propertyId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    linkedGroupId: {
      type: Schema.Types.ObjectId,
      ref: "VendorAccountGroup",
      default: null,
      index: true,
    },

    // Currently active property (hotel/tour/etc.) the vendor is managing
    activePropertyId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    serviceType: {
      type: String,
      enum: ["hotel", "adventure", "cab", "bike", "tour"],
      default: null,
      index: true,
    },

    businessName: {
      type: String,
      trim: true,
      index: true,
    },

    logo: {
      url: String,
      public_id: String,
      resource_type: { type: String, default: "image" },
    },

    businessEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    businessPhone: {
      type: String,
      trim: true,
      index: true,
    },

    businessAddress: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
    },

    // KYC Documents
    verificationDocs: [
      {
        docName: { type: String }, // aadhaarFront, aadhaarBack, panCard etc
        docUrl: { type: String },
        isVerified: { type: Boolean, default: false },
      },
    ],

    // Vendor approval flow
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "under_review",
        "approved",
        "rejected",
        "blocked",
      ],
      default: "draft",
      index: true,
    },

    // registration progress
    registrationStep: {
      type: Number,
      default: 1,
    },

    currentStep: {
      type: Number,
      default: 1,
    },

    rejectedSteps: {
      type: [Number], // multiple steps
      default: [],
    },

    rejectionReasons: {
      type: Object,
      default: {},
    },

    //timestamps for tracking
    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    blockedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isSubmitted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    blockReason: {
      type: String,
      trim: true,
    },

    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

vendorSchema.index({ status: 1 });
vendorSchema.index({ serviceType: 1 });
vendorSchema.index({ city: 1 });
vendorSchema.index({ userId: 1 });
vendorSchema.index({ propertyId: 1 }, { sparse: true });

const Vendor: Model<IVendor> = mongoose.model<IVendor>("Vendor", vendorSchema);

export default Vendor;
export { Vendor };
