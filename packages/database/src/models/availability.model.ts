import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAvailability extends Document {
  roomTypeId: Types.ObjectId;
  date: Date;
  bookedRooms: number;
  blockedRooms: number;
  priceOverride?: number;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    bookedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    blockedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    priceOverride: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true },
);

availabilitySchema.index({ roomTypeId: 1, date: 1 }, { unique: true });

const Availability: Model<IAvailability> = mongoose.model<IAvailability>("Availability", availabilitySchema);

export default Availability;
export { Availability };

