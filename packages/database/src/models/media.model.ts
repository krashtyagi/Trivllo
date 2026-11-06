import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogMedia extends Document {
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId?: string;
  mimeType?: string;
  fileSize?: number;
  altText?: string;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogMediaSchema = new Schema<IBlogMedia>(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    altText: {
      type: String,
      trim: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

blogMediaSchema.index({ uploadedBy: 1, createdAt: -1 });

const BlogMedia: Model<IBlogMedia> =
  mongoose.models.BlogMedia ||
  mongoose.model<IBlogMedia>("BlogMedia", blogMediaSchema);

export default BlogMedia;
