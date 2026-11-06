import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IGroupAccount {
  vendorId: Types.ObjectId;
  serviceType?: "hotel" | "adventure" | "cab" | "bike" | "tour";
  linkedAt: Date;
}

export interface IVendorAccountGroup extends Document {
  accounts: IGroupAccount[];
  primaryVendorId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorAccountGroupSchema = new Schema<IVendorAccountGroup>(
  {
    accounts: [
      {
        vendorId: {
          type: Schema.Types.ObjectId,
          ref: "Vendor",
          required: true,
        },

        serviceType: {
          type: String,
          enum: ["hotel", "adventure", "cab", "bike", "tour"],
        },

        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    primaryVendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

vendorAccountGroupSchema.index({
  "accounts.vendorId": 1,
});

const VendorAccountGroup: Model<IVendorAccountGroup> = mongoose.model<IVendorAccountGroup>("VendorAccountGroup", vendorAccountGroupSchema);

export default VendorAccountGroup;
export { VendorAccountGroup };

