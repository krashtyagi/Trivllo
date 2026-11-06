import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogRedirect extends Document {
  oldPath: string;
  newPath: string;
  statusCode: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogRedirectSchema = new Schema<IBlogRedirect>(
  {
    oldPath: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    newPath: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
  },
  {
    timestamps: true,
  }
);


const BlogRedirect: Model<IBlogRedirect> =
  mongoose.models.BlogRedirect ||
  mongoose.model<IBlogRedirect>("BlogRedirect", blogRedirectSchema);

export default BlogRedirect;
