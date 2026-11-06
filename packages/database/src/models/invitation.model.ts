import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogInvitation extends Document {
  email: string;
  invitedBy: mongoose.Types.ObjectId;
  assignedRole: "blog_author" | "blog_editor" | "seo_manager";
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogInvitationSchema = new Schema<IBlogInvitation>(
  {
    email: {
      type: String,
      required: [true, "Invitation email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedRole: {
      type: String,
      enum: ["blog_author", "blog_editor", "seo_manager"],
      required: true,
      default: "blog_author",
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

blogInvitationSchema.index({ email: 1, expiresAt: 1 });

const BlogInvitation: Model<IBlogInvitation> =
  mongoose.models.BlogInvitation ||
  mongoose.model<IBlogInvitation>("BlogInvitation", blogInvitationSchema);

export default BlogInvitation;
