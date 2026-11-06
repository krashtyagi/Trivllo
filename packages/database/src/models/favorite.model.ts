import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFavorite extends Document {
  user: Types.ObjectId;
  itemId: Types.ObjectId;
  itemType: "hotel" | "cab" | "bike" | "tour" | "adventure";
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["hotel", "cab", "bike", "tour", "adventure"],
      required: true,
    },
  },
  { timestamps: true },
);

favoriteSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

const Favorite: Model<IFavorite> = mongoose.model<IFavorite>("Favorite", favoriteSchema);

export default Favorite;
export { Favorite };

