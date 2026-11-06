import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogTag extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogTagSchema = new Schema<IBlogTag>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: [true, "Tag slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


const BlogTag: Model<IBlogTag> =
  mongoose.models.BlogTag ||
  mongoose.model<IBlogTag>("BlogTag", blogTagSchema);

export default BlogTag;
