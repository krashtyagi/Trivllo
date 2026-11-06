import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IRoomTypeBed {
  type: "single" | "double" | "king" | "queen" | "sofa";
  quantity: number;
}

export interface IRoomTypeCapacity {
  adults: number;
  children: number;
}

export interface IRoomTypeImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IRoomType extends Document {
  hotelId: Types.ObjectId;
  name: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  capacity: IRoomTypeCapacity;
  beds: IRoomTypeBed[];
  roomSizeSqm?: number;
  viewType: "city" | "sea" | "garden" | "mountain" | "lake" | "none";
  amenities: string[];
  images: IRoomTypeImage[];
  totalRooms: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function (this: any, value: number): boolean {
          if (!value || Number(value) === 0) return true;
          const base =
            this?.basePrice ??
            this?.getUpdate?.()?.basePrice ??
            this?.getUpdate?.()?.$set?.basePrice;
          if (base === undefined || base === null) return true;
          return Number(value) <= Number(base);
        },
        message: "Discount price cannot be greater than base price",
      },
    },

    capacity: {
      adults: {
        type: Number,
        default: 2,
        min: 0,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    beds: {
      type: [
        {
          type: {
            type: String,
            enum: ["single", "double", "king", "queen", "sofa"],
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
      validate: {
        validator: function (value: any[]): boolean {
          return value && value.length > 0;
        },
        message: "At least one bed configuration is required",
      },
    },

    roomSizeSqm: {
      type: Number,
      min: 0,
    },

    viewType: {
      type: String,
      enum: ["city", "sea", "garden", "mountain", "lake", "none"],
      default: "none",
    },

    amenities: [String],

    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const RoomType: Model<IRoomType> = mongoose.model<IRoomType>("RoomType", roomTypeSchema);

export default RoomType;
export { RoomType };

