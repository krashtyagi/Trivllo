import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IVendorReply {
  message?: string;
  repliedAt?: Date;
}

export interface IReviewBreakdown {
  facilities: number;
  cleanliness: number;
  services: number;
  comfort: number;
  location: number;
}

export interface IReview extends Document {
  userId: Types.ObjectId;
  bookingId: Types.ObjectId;
  companyId: Types.ObjectId;
  companyName: string;
  companyType: "hotel" | "adventure" | "tour" | "cab" | "bike";
  vendorId: Types.ObjectId;
  rating: number;
  breakdown?: IReviewBreakdown;
  comment?: string;
  vendorReply?: IVendorReply;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyType: {
      type: String,
      enum: ["hotel", "adventure", "tour", "cab", "bike"],
      required: true,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    breakdown: {
      facilities: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      services: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
    },

    vendorReply: {
      message: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      repliedAt: Date,
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({
  companyType: 1,
  companyId: 1,
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
export { Review };

