import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPopularSection extends Document {
  tagline: string;
  city: string;
  category: "hotel" | "tour" | "cab" | "bike" | "adventure";
  aliases: string[];
  order: number;
  isActive: boolean;
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

const popularSectionSchema = new Schema<IPopularSection>(
  {
    tagline: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["hotel", "tour", "cab", "bike", "adventure"],
      default: "hotel",
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    limit: {
      type: Number,
      default: 12,
    },
  },
  { timestamps: true }
);

popularSectionSchema.index({ category: 1, isActive: 1, order: 1 });

const PopularSection: Model<IPopularSection> =
  mongoose.models.PopularSection ||
  mongoose.model<IPopularSection>("PopularSection", popularSectionSchema);

export default PopularSection;
