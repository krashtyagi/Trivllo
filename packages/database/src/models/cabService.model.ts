import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICabServiceImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface ICabServiceMeta {
  distance?: string;
  duration?: string;
}

export interface ICabService extends Document {
  cab: Types.ObjectId;
  title: string;
  pickupLocation: string;
  dropLocation: string;
  carName: string;
  cabType: "hatchback" | "sedan" | "suv" | "luxury";
  capacity: number;
  carNumber?: string;
  images?: ICabServiceImage[];
  description?: string;
  features?: string[];
  basePrice: number;
  discountPrice?: number;
  meta?: ICabServiceMeta;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cabServiceSchema = new Schema<ICabService>(
  {
    cab: {
      type: Schema.Types.ObjectId,
      ref: "CabCompany",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    dropLocation: {
      type: String,
      required: true,
      trim: true,
    },

    carName: {
      type: String,
      required: true,
      trim: true,
    },

    cabType: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "luxury"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    carNumber: String,

    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],
    description: String,

    features: [String],

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function (this: any, value: number): boolean {
          return value <= this.basePrice;
        },
        message: "Discount price cannot be greater than base price",
      },
    },

    //in vendor side use 3rd party api to calculate distance and duration
    meta: {
      distance: String, // in km
      duration: String, // in hours
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

cabServiceSchema.index({
  pickupLocation: 1,
  dropLocation: 1,
  isActive: 1,
  cabType: 1,
  basePrice: 1,
});

cabServiceSchema.index({ cab: 1, isActive: 1 });

cabServiceSchema.index({ title: "text", description: "text" });

const CabService: Model<ICabService> = mongoose.model<ICabService>("CabService", cabServiceSchema);

export default CabService;
export { CabService };

