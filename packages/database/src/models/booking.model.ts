import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IGuest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface IAdditionalGuest {
  firstName: string;
  lastName: string;
}

export interface IGuestCount {
  adults: number;
  children: number;
}

export interface IBooking extends Document {
  userId?: Types.ObjectId | null;
  hotelId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  bookingReference: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  primaryGuest: IGuest;
  additionalGuests: IAdditionalGuest[];
  guests: IGuestCount;
  roomsBooked: number;
  pricePerNight: number;
  taxAmount: number;
  cleaningFee: number;
  discountAmount: number;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "checked_in"
    | "staying"
    | "checked_out"
    | "completed"
    | "cancellation_requested"
    | "cancelled";
  roomNumber: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: Types.ObjectId;
  refundPercentage: number;
  refundAmount: number;
  refundStatus: "none" | "pending" | "approved" | "rejected" | "processed";
  refundRequestedAt?: Date;
  refundProcessedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  policyApplied?: string;
  totalTax?: number;
  actualCheckInAt?: Date;
  actualCheckOutAt?: Date;
  specialRequest?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

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

    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    nights: {
      type: Number,
      required: true,
    },

    primaryGuest: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },
    },

    additionalGuests: {
      type: [
        {
          firstName: {
            type: String,
            required: true,
            trim: true,
          },
          lastName: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },

    guests: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
    },

    roomsBooked: {
      type: Number,
      default: 1,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    cleaningFee: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "staying",
        "checked_out",
        "completed",
        "cancellation_requested",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    roomNumber: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    refundPercentage: {
      type: Number,
      default: 0,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundStatus: {
      type: String,
      enum: [
        "none",
        "pending", //waiting for admin approval
        "approved",
        "rejected",
        "processed",
      ],
      default: "none",
    },

    refundRequestedAt: Date,
    refundProcessedAt: Date,

    cancelledAt: Date,
    cancellationReason: {
      type: String,
      trim: true,
    },
    actualCheckInAt: Date,
    actualCheckOutAt: Date,

    specialRequest: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      index: { expires: "0s" },
    },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ hotelId: 1, checkIn: 1 });
bookingSchema.index({
  roomTypeId: 1,
  checkIn: 1,
  checkOut: 1,
  status: 1,
});

const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
export { Booking };

