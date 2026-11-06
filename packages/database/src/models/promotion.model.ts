import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPromotion extends Document {
  vendorId: Types.ObjectId;
  serviceType: "hotel" | "cab" | "bike" | "tour" | "adventure";
  serviceId: Types.ObjectId;
  plan: "Boost" | "Premium" | "Elite" | "Admin" | "Direct";
  status: "pending" | "approved" | "rejected";
  rankAssigned?: "A" | "B" | "C" | null;
  startDate: Date;
  endDate?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: Types.ObjectId | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Promotion must be linked to a Vendor"],
      index: true,
    },
    serviceType: {
      type: String,
      enum: ["hotel", "cab", "bike", "tour", "adventure"],
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["Boost", "Premium", "Elite", "Admin", "Direct"],
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rankAssigned: {
      type: String,
      enum: ["A", "B", "C"],
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ vendorId: 1, status: 1 });
promotionSchema.index({ serviceId: 1, status: 1 });

const Promotion: Model<IPromotion> = mongoose.model<IPromotion>("Promotion", promotionSchema);

export default Promotion;
export { Promotion };

