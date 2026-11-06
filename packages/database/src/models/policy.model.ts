import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IHotelPolicy extends Document {
  hotelId: Types.ObjectId;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  prepaymentRequired?: boolean;
  childrenAllowed?: boolean;
  extraBedPolicy?: string;
  ageRestriction?: string;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  quietHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IHotelPolicy>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      unique: true,
    },

    checkInTime: String,
    checkOutTime: String,

    cancellationPolicy: String,
    prepaymentRequired: Boolean,

    childrenAllowed: Boolean,
    extraBedPolicy: String,
    ageRestriction: String,

    smokingAllowed: Boolean,
    petsAllowed: Boolean,
    quietHours: String,
  },
  { timestamps: true },
);

const HotelPolicy: Model<IHotelPolicy> = mongoose.model<IHotelPolicy>("HotelPolicy", policySchema);

export default HotelPolicy;
export { HotelPolicy };

