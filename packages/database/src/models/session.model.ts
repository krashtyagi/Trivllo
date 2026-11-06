import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: mongoose.Types.ObjectId | string;
}

const sessionSchema = new Schema<ISession>(
  {
    id: { type: String, required: false },
    expiresAt: { type: Date, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "session", // Exactly matches Better Auth collection
  }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);

export default Session;
