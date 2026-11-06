import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAdventureImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IAdventureDoc {
  docName?: string;
  docUrl?: string;
  public_id?: string;
  resource_type?: string;
  isVerified?: boolean;
}

export interface IAdventureRating {
  average: number;
  count: number;
}

export interface IAdventurePriceRange {
  min?: number;
  max?: number;
}

export interface IAdventureLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface IAdventure extends Document {
  vendorId: Types.ObjectId;
  name: string;
  category: "rafting" | "paragliding" | "bungee" | "trekking";
  location?: IAdventureLocation;
  address?: any;
  coordinates?: { lat?: number; lng?: number };
  locationHistory?: any[];
  images?: IAdventureImage[];
  advertisementImage?: IAdventureImage;
  documents?: IAdventureDoc[];
  description?: string;
  features?: string[];
  rating: IAdventureRating;
  priceRange?: IAdventurePriceRange;
  verificationStatus: "pending" | "verified" | "rejected";
  isFeatured: boolean;
  rank?: "A" | "B" | "C" | null;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adventureSchema = new Schema<IAdventure>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Adventure name is required"],
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["rafting", "paragliding", "bungee", "trekking"],
      index: true,
    },

    location: {
      city: {
        type: String,
        index: true,
      },
      state: { type: String },
      country: { type: String, default: "India" },
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

    features: [
      {
        type: String,
        trim: true,
      },
    ],

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

    priceRange: {
      min: Number,
      max: Number,
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

adventureSchema.index({ category: 1, "location.city": 1 });
adventureSchema.index({ vendorId: 1, createdAt: -1 });

const Adventure: Model<IAdventure> = mongoose.model<IAdventure>("Adventure", adventureSchema);

export default Adventure;
export { Adventure };

