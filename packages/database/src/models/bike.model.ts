import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBikeImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IBikeDoc {
  docName?: string;
  docUrl?: string;
  public_id?: string;
  resource_type?: string;
  isVerified?: boolean;
}

export interface IBikeLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface IBikeRentalPolicies {
  helmetIncluded?: boolean;
  fuelPolicy?: string;
  securityDeposit?: number;
  licenseRequired?: boolean;
}

export interface IBikeRating {
  average: number;
  count: number;
}

export interface IBikeCompany extends Document {
  vendorId: Types.ObjectId;
  name: string;
  location: IBikeLocation;
  address?: any;
  coordinates?: { lat?: number; lng?: number };
  locationHistory?: any[];
  images?: IBikeImage[];
  advertisementImage?: IBikeImage;
  documents?: IBikeDoc[];
  description?: string;
  features?: string[];
  rentalPolicies?: IBikeRentalPolicies;
  rating: IBikeRating;
  verificationStatus: "pending" | "verified" | "rejected";
  isFeatured: boolean;
  rank?: "A" | "B" | "C" | null;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bikeCompanySchema = new Schema<IBikeCompany>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Bike company name is required"],
      trim: true,
    },

    location: {
      city: {
        type: String,
        required: true,
      },
      state: { type: String },
      country: {
        type: String,
        default: "India",
      },
    },

    address: {
      type: Schema.Types.Mixed,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    locationHistory: [
      {
        address: { type: Schema.Types.Mixed },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        coordinates: {
          lat: Number,
          lng: Number,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],

    advertisementImage: {
      url: String,
      public_id: String,
      resource_type: { type: String, default: "image" },
    },

    documents: [
      {
        docName: String,
        docUrl: String,
        public_id: String,
        resource_type: String,
        isVerified: { type: Boolean, default: false },
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    features: [String],

    rentalPolicies: {
      helmetIncluded: { type: Boolean, default: false },
      fuelPolicy: { type: String, trim: true },
      securityDeposit: { type: Number, default: 0 },
      licenseRequired: { type: Boolean, default: true },
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    rank: {
      type: String,
      enum: ["A", "B", "C", null],
      default: null,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

bikeCompanySchema.index({ "location.city": 1, isActive: 1 });
bikeCompanySchema.index({ vendorId: 1, createdAt: -1 });

const BikeCompany: Model<IBikeCompany> = mongoose.model<IBikeCompany>("BikeCompany", bikeCompanySchema);

export default BikeCompany;
export { BikeCompany };

