import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISupportAttachment {
  url?: string;
  public_id?: string;
}

export interface ISupportMessage {
  sender: "user" | "admin";
  message: string;
  attachments?: ISupportAttachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISupport extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  description: string;
  bookingReference?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  messages: ISupportMessage[];
  closedAt?: Date;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<ISupportMessage>(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    attachments: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true },
);

const supportSchema = new Schema<ISupport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    bookingReference: {
      type: String,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    //Chat messages
    messages: [messageSchema],

    closedAt: Date,

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

supportSchema.index({ status: 1, createdAt: -1 });

const Support: Model<ISupport> = mongoose.model<ISupport>("Support", supportSchema);

export default Support;
export { Support };

