import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITax extends Document {
  taxPercentage: number;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taxSchema = new Schema<ITax>(
  {
    taxPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // superadmin
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 🔥 Ensure only one active tax config at a time
taxSchema.index({ isActive: 1 });

const Tax: Model<ITax> = mongoose.model<ITax>("Tax", taxSchema);

export default Tax;
export { Tax };

