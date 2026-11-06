import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBikeServiceImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IBikeServiceMeta {
  mileage?: string;
  gearType?: string;
}

export interface IBikeService extends Document {
  bike: Types.ObjectId;
  title: string;
  bikeName: string;
  bikeType: "scooter" | "cruiser" | "sports" | "standard";
  engineCC?: number;
  fuelType: "petrol" | "electric";
  pricePerDay: number;
  discountPrice?: number;
  maxDurationDays: number;
  description?: string;
  features?: string[];
  images?: IBikeServiceImage[];
  meta?: IBikeServiceMeta;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bikeServiceSchema = new Schema<IBikeService>(
  {
    bike: {
      type: Schema.Types.ObjectId,
      ref: "BikeCompany",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    bikeName: {
      type: String,
      required: true,
      trim: true,
    },

    bikeType: {
      type: String,
      enum: ["scooter", "cruiser", "sports", "standard"],
      required: true,
    },

    engineCC: Number,

    fuelType: {
      type: String,
      enum: ["petrol", "electric"],
      default: "petrol",
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDurationDays: {
      type: Number,
      default: 7,
    },

    description: {
      type: String,
      trim: true,
    },

    features: [String],
    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],
    meta: {
      mileage: String,
      gearType: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

bikeServiceSchema.index({ bike: 1, isActive: 1 });
bikeServiceSchema.index({ bikeType: 1, pricePerDay: 1 });

const BikeService: Model<IBikeService> = mongoose.model<IBikeService>("BikeService", bikeServiceSchema);

export default BikeService;
export { BikeService };

