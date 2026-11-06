import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IParticipant {
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  weight?: number;
}

export interface IGenericBookingDuration {
  startDate?: Date;
  endDate?: Date;
  totalDays?: number;
}

export interface IPrimaryCustomer {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
}

export interface IPricingSnapshot {
  baseAmount: number;
  taxAmount: number;
  taxPercentage: number;
  discountAmount: number;
  totalAmount: number;
}

export interface IServiceSnapshot {
  title?: string;
  type?: string;
  price?: number;
  vendorId?: Types.ObjectId;
  extra?: Record<string, any>;
}

export interface IGenericBooking extends Document {
  userId?: Types.ObjectId;
  vendorId: Types.ObjectId;
  serviceType: "adventure" | "cab" | "tour" | "bike";
  serviceId: Types.ObjectId;
  bookingReference: string;
  bookingDate: Date;
  timeSlot?: string;
  duration?: IGenericBookingDuration;
  primaryCustomer: IPrimaryCustomer;
  participants: IParticipant[];
  meta?: Record<string, any>;
  extraInfo?: Record<string, any>;
  pricing: IPricingSnapshot;
  serviceSnapshot?: IServiceSnapshot;
  quantity: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: Types.ObjectId;
  refundAmount: number;
  refundStatus: "none" | "pending" | "processed" | "failed";
  specialRequest?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    name: { type: String, trim: true },
    age: { type: Number },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    weight: { type: Number }, // optional (adventure use)
  },
  { _id: false },
);

const bookingSchema = new Schema<IGenericBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    serviceType: {
      type: String,
      enum: ["adventure", "cab", "tour", "bike"],
      required: true,
      index: true,
    },

    serviceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    bookingReference: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },

    timeSlot: {
      type: String, //adventure specific
    },

    // bike & tour specific
    duration: {
      startDate: Date,
      endDate: Date,
      totalDays: Number,
    },

    primaryCustomer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, trim: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phoneNumber: { type: String, required: true, trim: true },
    },

    //Participants (Dynamic)
    participants: {
      type: [participantSchema],
      default: [],
    },

    //Dynamic Data
    meta: {
      type: Object,
      default: {},
    },

    extraInfo: {
      type: Object,
      default: {},
    },

    //Pricing Snapshot
    pricing: {
      baseAmount: { type: Number, required: true },
      taxAmount: { type: Number, default: 0 },
      taxPercentage: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },

    serviceSnapshot: {
      title: { type: String },
      type: { type: String },
      price: { type: Number },
      vendorId: { type: Schema.Types.ObjectId },
      extra: {
        type: Object,
        default: {},
      },
    },

    // quantity meaning:
    // adventure → participants
    // bike → days
    // tour → people
    // cab → 1
    quantity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    specialRequest: {
      type: String,
      trim: true,
    },

    cancelledAt: Date,
    cancellationReason: { type: String, trim: true },

    expiresAt: {
      type: Date,
      index: { expires: "0s" },
    },
  },
  { timestamps: true },
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ vendorId: 1, createdAt: -1 });
bookingSchema.index({ serviceId: 1, serviceType: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ paymentStatus: 1, status: 1 });
bookingSchema.index({ bookingReference: 1 });

const GenericBooking: Model<IGenericBooking> = mongoose.model<IGenericBooking>("GenericBooking", bookingSchema);

export default GenericBooking;
export { GenericBooking };

