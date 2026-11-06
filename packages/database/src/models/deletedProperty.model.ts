import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IDeletedProperty extends Document {
  originalVendorId?: Types.ObjectId;
  propertyId: string;
  propertyName: string;
  businessName: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  serviceType: "hotel" | "tour" | "cab" | "bike" | "adventure" | "other";
  city: string;
  reason: string;
  deletedBy?: Types.ObjectId;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deletedPropertySchema = new Schema<IDeletedProperty>(
  {
    originalVendorId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    propertyId: {
      type: String,
      default: "",
      index: true,
    },
    propertyName: {
      type: String,
      default: "Unnamed Property",
      trim: true,
    },
    businessName: {
      type: String,
      default: "N/A",
      trim: true,
    },
    vendorName: {
      type: String,
      default: "N/A",
      trim: true,
    },
    vendorEmail: {
      type: String,
      default: "",
      trim: true,
    },
    vendorPhone: {
      type: String,
      default: "",
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["hotel", "tour", "cab", "bike", "adventure", "other"],
      default: "hotel",
      index: true,
    },
    city: {
      type: String,
      default: "N/A",
      trim: true,
    },
    reason: {
      type: String,
      default: "Deleted by administrator",
      trim: true,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

deletedPropertySchema.index({ deletedAt: -1 });

const DeletedProperty: Model<IDeletedProperty> = mongoose.model<IDeletedProperty>("DeletedProperty", deletedPropertySchema);

export default DeletedProperty;
export { DeletedProperty };

