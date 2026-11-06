import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICabImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface ICabDoc {
  docName?: string;
  docUrl?: string;
  public_id?: string;
  resource_type?: string;
  isVerified?: boolean;
}

export interface ICabRating {
  average: number;
  count: number;
}

export interface ICabCompanyLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface ICabCoordinates {
  lat?: number;
  lng?: number;
}

export interface ICabCompany extends Document {
  vendorId: Types.ObjectId;
  name: string;
  location: ICabCompanyLocation;
  address?: any;
  coordinates?: ICabCoordinates;
  locationHistory?: any[];
  images?: ICabImage[];
  advertisementImage?: ICabImage;
  documents?: ICabDoc[];
  description?: string;
  features?: string[];
  rating: ICabRating;
  verificationStatus: "pending" | "verified" | "rejected";
  isFeatured: boolean;
  rank?: "A" | "B" | "C" | null;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cabCompanySchema = new Schema<ICabCompany>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      city: {
        type: String,
        required: true,
      },
      state: String,
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

    description: String,

    features: [String],

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
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
    },
  },
  { timestamps: true },
);

cabCompanySchema.index({ name: "text", description: "text" });
cabCompanySchema.index({ "location.city": 1, isActive: 1 });
cabCompanySchema.index({ vendorId: 1, createdAt: -1 });

const CabCompany: Model<ICabCompany> = mongoose.model<ICabCompany>("CabCompany", cabCompanySchema);

export default CabCompany;
export { CabCompany };

