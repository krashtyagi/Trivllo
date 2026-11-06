import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAddressLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IAddress {
  buildingName?: string;
  doorNumber?: string;
  streetAddress?: string;
  areaName?: string;
  city: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  landmark?: string;
  directions?: string;
  formattedAddress?: string;
  location?: IAddressLocation;
  placeId?: string;
  timeZone?: string;
}

export interface IHotelImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface IHotelDocument {
  docName?: string;
  docUrl?: string;
  public_id?: string;
  resource_type?: string;
  isVerified?: boolean;
}

export interface IHotelAccessibility {
  wheelchairAccessible?: boolean;
  grabBars?: boolean;
  hearingSupport?: boolean;
  elevator?: boolean;
}

export interface IHotel extends Document {
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  address: IAddress;
  city: string;
  location: IAddressLocation;
  locationHistory?: any[];
  images?: IHotelImage[];
  advertisementImage?: IHotelImage;
  documents?: IHotelDocument[];
  amenities: string[];
  accessibility?: IHotelAccessibility;
  distanceFromCenter?: number;
  rating?: number;
  numReviews?: number;
  verificationStatus: "pending" | "verified" | "rejected";
  isFeatured?: boolean;
  rank?: "A" | "B" | "C" | null;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Deep, powerful address sub-schema
const addressSchema = new Schema<IAddress>(
  {
    // 1. Street & Door Level Details
    buildingName: { type: String, trim: true, default: "" },
    doorNumber: { type: String, trim: true, default: "" },
    streetAddress: { type: String, trim: true, default: "" },
    areaName: { type: String, trim: true, index: true, default: "" }, // Town / locality / neighborhood

    // 2. City & Administrative Hierarchy
    city: { type: String, required: true, trim: true, index: true },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, index: true, default: "" },
    postalCode: { type: String, trim: true, index: true, default: "" },
    country: { type: String, trim: true, default: "India", index: true },
    countryCode: { type: String, uppercase: true, trim: true, maxlength: 2, default: "IN" },

    // 3. Navigation & Local Context
    landmark: { type: String, trim: true, default: "" },
    directions: { type: String, trim: true, default: "" },

    // 4. Pre-Formatted Address
    formattedAddress: { type: String, trim: true, default: "" },

    // 5. Native GeoJSON Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [72.8777, 19.0760], // Default [lng, lat]
      },
    },

    // 6. External Geocoding Provider References
    placeId: { type: String, trim: true, default: "" },
    timeZone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const hotelSchema = new Schema<IHotel>(
  {
    vendorId: {
      type: mongoose.Schema.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Embedded Powerful Address Schema
    address: {
      type: addressSchema,
      required: true,
    },

    // Top-level city kept in sync for direct access & backward compatibility
    city: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // Top-level GeoJSON location kept in sync for 2dsphere indexing & queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    locationHistory: [
      {
        address: { type: mongoose.Schema.Types.Mixed },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        coordinates: [Number],
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    images: [
      {
        url: String,
        public_id: String,
        resource_type: String,
      },
    ],

    advertisementImage: {
      url: String,
      public_id: String,
      resource_type: { type: String, default: "image" },
    },

    documents: [
      {
        docName: String,
        docUrl: String,
        public_id: String,
        resource_type: String,
        isVerified: { type: Boolean, default: false },
      },
    ],
    amenities: {
      type: [String],
      default: [],
    },

    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false,
      },
      grabBars: {
        type: Boolean,
        default: false,
      },
      hearingSupport: {
        type: Boolean,
        default: false,
      },
      elevator: {
        type: Boolean,
        default: false,
      },
    },

    distanceFromCenter: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    rank: {
      type: String,
      enum: ["A", "B", "C", null],
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Pre-validation hook to synchronize address, city, and location bidirectionally
hotelSchema.pre("validate", function (next) {
  const self = this as any;

  // If address is passed as a string (legacy data)
  if (typeof self.address === "string") {
    const rawAddress = self.address;
    self.address = {
      streetAddress: rawAddress,
      city: this.city || "Default City",
      formattedAddress: rawAddress,
      location: this.location || { type: "Point", coordinates: [72.8777, 19.0760] },
    };
  } else if (!self.address && this.city) {
    self.address = {
      streetAddress: "",
      city: this.city,
      formattedAddress: this.city,
      location: this.location || { type: "Point", coordinates: [72.8777, 19.0760] },
    };
  }

  // Ensure city is synchronized
  if (this.address?.city && !this.city) {
    this.city = this.address.city;
  }
  if (this.city && this.address && !this.address.city) {
    this.address.city = this.city;
  }

  // Ensure location coordinates are synchronized
  if (
    this.address?.location?.coordinates?.length &&
    (!this.location || !this.location.coordinates?.length)
  ) {
    this.location = this.address.location;
  }
  if (
    this.location?.coordinates?.length &&
    this.address &&
    (!this.address.location || !this.address.location.coordinates?.length)
  ) {
    this.address.location = this.location;
  }

  // Auto-compose formattedAddress if missing
  if (this.address && !this.address.formattedAddress) {
    const parts = [
      this.address.doorNumber,
      this.address.buildingName,
      this.address.streetAddress,
      this.address.areaName,
      this.address.landmark,
      this.address.city,
      this.address.district,
      this.address.state,
      this.address.postalCode,
      this.address.country,
    ].filter(Boolean);
    this.address.formattedAddress = parts.join(", ");
  }

  if (typeof next === "function") {
    next();
  }
});

// Indexes for ultra-fast queries & radius search
hotelSchema.index({ "address.location": "2dsphere" });
hotelSchema.index({ location: "2dsphere" });

hotelSchema.index({ "address.city": 1, "address.state": 1, "address.country": 1 });
hotelSchema.index({ city: 1 });

hotelSchema.index(
  {
    name: "text",
    city: "text",
    "address.city": "text",
    "address.areaName": "text",
    "address.district": "text",
    "address.streetAddress": "text",
    "address.landmark": "text",
    "address.formattedAddress": "text",
    description: "text",
  },
  {
    weights: {
      name: 5,
      "address.city": 4,
      city: 4,
      "address.areaName": 4,
      "address.district": 3,
      "address.streetAddress": 2,
      "address.landmark": 2,
      description: 1,
    },
  },
);

const Hotel: Model<IHotel> = mongoose.model<IHotel>("Hotel", hotelSchema);

export default Hotel;
export { Hotel, addressSchema };


