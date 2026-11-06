import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IRoomAccessibility {
  wheelchairAccessible?: boolean;
  grabBars?: boolean;
}

export interface IRoom extends Document {
  hotelId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  roomNumber: string;
  floor?: number;
  status: "available" | "occupied" | "maintenance";
  accessibility?: IRoomAccessibility;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
    },
    floor: Number,

    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },

    accessibility: {
      wheelchairAccessible: Boolean,
      grabBars: Boolean,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Room: Model<IRoom> = mongoose.model<IRoom>("Room", roomSchema);

export default Room;
export { Room };

