import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogAuthorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  slug: string;
  bio?: string;
  avatar?: string;
  designation?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  isPublic: boolean;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogAuthorProfileSchema = new Schema<IBlogAuthorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Author display name is required"],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, "Author slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    avatar: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: "Travel Writer",
    },
    socialLinks: {
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      instagram: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);


const BlogAuthorProfile: Model<IBlogAuthorProfile> =
  mongoose.models.BlogAuthorProfile ||
  mongoose.model<IBlogAuthorProfile>(
    "BlogAuthorProfile",
    blogAuthorProfileSchema
  );

export default BlogAuthorProfile;
