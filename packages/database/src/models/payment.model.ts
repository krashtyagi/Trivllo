import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amountPaid: number;
  currency: string;
  paymentMethod: "card" | "upi" | "netbanking" | "wallet" | "unknown";
  status: "created" | "authorized" | "captured" | "failed" | "refunded" | "partially_refunded";
  refundAmount: number;
  razorpayRefundId?: string;
  refundStatus: "none" | "initiated" | "pending" | "processed" | "failed";
  refundedAt?: Date;
  isVerified: boolean;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "unknown"],
      default: "unknown",
    },

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "created",
      index: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    razorpayRefundId: {
      type: String,
    },

    refundStatus: {
      type: String,
      enum: ["none", "initiated", "pending", "processed", "failed"],
      default: "none",
    },

    refundedAt: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Object,
    },

    expiresAt: {
      type: Date,
      index: { expires: "0s" },
    },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ bookingId: 1, status: 1 });

const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
export { Payment };

