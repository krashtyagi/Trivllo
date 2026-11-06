import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogPostView extends Document {
  postId: mongoose.Types.ObjectId;
  viewedAt: Date;
  visitorId?: string;
  referrer?: string;
  source?: string;
}

const blogPostViewSchema = new Schema<IBlogPostView>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    visitorId: {
      type: String,
      trim: true,
    },
    referrer: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

blogPostViewSchema.index({ postId: 1, viewedAt: -1 });

const BlogPostView: Model<IBlogPostView> =
  mongoose.models.BlogPostView ||
  mongoose.model<IBlogPostView>("BlogPostView", blogPostViewSchema);

export default BlogPostView;
