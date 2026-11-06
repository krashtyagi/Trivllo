import mongoose, { Document, Model, Schema } from "mongoose";

export type BlogPostStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export interface IBlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaType: string;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  authorId: mongoose.Types.ObjectId;
  status: BlogPostStatus;
  rejectionReason?: string;
  readingTime: number; // in minutes
  isFeatured: boolean;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  categories: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  seo: IBlogSEO;
  viewsCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogSEOSchema = new Schema<IBlogSEO>(
  {
    metaTitle: { type: String, trim: true, maxlength: 100 },
    metaDescription: { type: String, trim: true, maxlength: 250 },
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
    schemaType: { type: String, default: "BlogPosting" },
  },
  { _id: false }
);

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, "Post slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author reference is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    readingTime: {
      type: Number,
      default: 1,
      min: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogCategory",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogTag",
      },
    ],
    seo: {
      type: blogSEOSchema,
      default: () => ({
        robotsIndex: true,
        robotsFollow: true,
        schemaType: "BlogPosting",
      }),
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate reading time before save
blogPostSchema.pre("save", function () {
  if (this.isModified("content") && this.content) {
    const wordCount = this.content.replace(/<[^>]*>?/gm, "").split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
});

// Indexes for high performance querying & SEO filtering
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ status: 1, isFeatured: -1, publishedAt: -1 });
blogPostSchema.index({ authorId: 1, status: 1 });
blogPostSchema.index({ categories: 1, status: 1 });
blogPostSchema.index({ tags: 1, status: 1 });
blogPostSchema.index({ title: "text", excerpt: "text", content: "text" });

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", blogPostSchema);

export default BlogPost;
