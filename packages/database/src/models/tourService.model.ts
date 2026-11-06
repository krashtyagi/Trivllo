import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITourItinerary {
  day: number;
  title?: string;
  description?: string;
  highlights?: string[];
}

export interface ITourDuration {
  days: number;
  nights: number;
}

export interface ITourServiceImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface ITourServiceMeta {
  hotelType?: string;
  transport?: string;
  mealPlan?: string;
}

export interface ITourService extends Document {
  tour: Types.ObjectId;
  title: string;
  destinations?: string[];
  duration: ITourDuration;
  basePrice: number;
  discountPrice?: number;
  features?: string[];
  tourType?: string[];
  amenities?: string[];
  images?: ITourServiceImage[];
  description?: string;
  itinerary?: ITourItinerary[];
  meta?: ITourServiceMeta;
  maxPeople?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const itinerarySchema = new Schema<ITourItinerary>(
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

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false },
);

const tourServiceSchema = new Schema<ITourService>(
  {
    tour: {
      type: Schema.Types.ObjectId,
      ref: "TourCompany",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    destinations: [
      {
        type: String,
        trim: true,
      },
    ],

    duration: {
      days: {
        type: Number,
        required: true,
      },
      nights: {
        type: Number,
        required: true,
      },
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
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    tourType: [
      {
        type: String,
        trim: true,
      },
    ],

    amenities: [
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
    description: {
      type: String,
      trim: true,
    },
    itinerary: [itinerarySchema],

    //OPTIONAL META
    meta: {
      hotelType: { type: String }, // 3 star / 4 star
      transport: { type: String }, // cab / bus
      mealPlan: { type: String }, // MAP / AP
    },

    maxPeople: {
      type: Number,
      default: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

tourServiceSchema.index({ tour: 1 });
tourServiceSchema.index({ title: "text", description: "text" });
tourServiceSchema.index({ basePrice: 1 });
tourServiceSchema.index({ isActive: 1 });

const TourService: Model<ITourService> = mongoose.model<ITourService>("TourService", tourServiceSchema);

export default TourService;
export { TourService };

