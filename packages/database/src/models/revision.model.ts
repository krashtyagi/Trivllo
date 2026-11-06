import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogRevision extends Document {
  postId: mongoose.Types.ObjectId;
  editorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt?: string;
  revisionNumber: number;
  createdAt: Date;
}

const blogRevisionSchema = new Schema<IBlogRevision>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      required: true,
      index: true,
    },
    editorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
    },
    revisionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

blogRevisionSchema.index({ postId: 1, revisionNumber: -1 });

const BlogRevision: Model<IBlogRevision> =
  mongoose.models.BlogRevision ||
  mongoose.model<IBlogRevision>("BlogRevision", blogRevisionSchema);

export default BlogRevision;
