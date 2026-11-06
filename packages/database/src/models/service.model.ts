import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAdventureItinerary {
  day: number;
  title?: string;
  description?: string;
}

export interface IAdventureServiceImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IAdventureServiceMeta {
  distance?: string;
  duration?: string;
  days?: number;
  nights?: number;
}

export interface IAdventureService extends Document {
  adventure: Types.ObjectId;
  title: string;
  type: "distance" | "time" | "fixed" | "package";
  basePrice: number;
  discountPrice?: number;
  meta?: IAdventureServiceMeta;
  features?: string[];
  images?: IAdventureServiceImage[];
  itinerary?: IAdventureItinerary[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itinerarySchema = new Schema<IAdventureItinerary>(
  {
    day: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const serviceSchema = new Schema<IAdventureService>(
  {
    adventure: {
      type: Schema.Types.ObjectId,
      ref: "Adventure",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["distance", "time", "fixed", "package"],
      index: true,
    },

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

    meta: {
      distance: { type: String }, // "6KM"
      duration: { type: String }, // "15 min"
      days: { type: Number },
      nights: { type: Number },
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],

    itinerary: [itinerarySchema], //only for trekking

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

serviceSchema.index({ adventure: 1, type: 1 });
serviceSchema.index({ adventure: 1, basePrice: 1 });
serviceSchema.index({ adventure: 1, discountPrice: 1 });

const Service: Model<IAdventureService> = mongoose.model<IAdventureService>("Service", serviceSchema);

export default Service;
export { Service };

