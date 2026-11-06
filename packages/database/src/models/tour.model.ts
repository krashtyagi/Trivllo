import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITourAddressLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface ITourAddress {
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
  location?: ITourAddressLocation;
  placeId?: string;
  timeZone?: string;
}

export interface ITourImage {
  url?: string;
  public_id?: string;
  resource_type?: string;
}

export interface ITourDoc {
  docName?: string;
  docUrl?: string;
  public_id?: string;
  resource_type?: string;
  isVerified?: boolean;
}

export interface ITourRating {
  average: number;
  count: number;
}

export interface ITourCompanyLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface ITourCompany extends Document {
  vendorId: Types.ObjectId;
  name: string;
  location: ITourCompanyLocation;
  address?: any;
  coordinates?: { lat?: number; lng?: number };
  locationHistory?: any[];
  logo?: ITourImage;
  images?: ITourImage[];
  advertisementImage?: ITourImage;
  documents?: ITourDoc[];
  description?: string;
  features?: string[];
  tags?: string[];
  rating: ITourRating;
  verificationStatus: "pending" | "verified" | "rejected";
  isFeatured: boolean;
  rank?: "A" | "B" | "C" | null;
  createdBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Deep, powerful address sub-schema
const addressSchema = new Schema<ITourAddress>(
  {
    buildingName: { type: String, trim: true, default: "" },
    doorNumber: { type: String, trim: true, default: "" },
    streetAddress: { type: String, trim: true, default: "" },
    areaName: { type: String, trim: true, index: true, default: "" }, // Town / locality / neighborhood

    city: { type: String, required: true, trim: true, index: true },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, index: true, default: "" },
    postalCode: { type: String, trim: true, index: true, default: "" },
    country: { type: String, trim: true, default: "India", index: true },
    countryCode: { type: String, uppercase: true, trim: true, maxlength: 2, default: "IN" },

    landmark: { type: String, trim: true, default: "" },
    directions: { type: String, trim: true, default: "" },

    formattedAddress: { type: String, trim: true, default: "" },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [72.8777, 19.0760], // [lng, lat]
      },
    },

    placeId: { type: String, trim: true, default: "" },
    timeZone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const tourCompanySchema = new Schema<ITourCompany>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tour company name is required"],
      trim: true,
      index: true,
    },

    location: {
      city: {
        type: String,
        required: true,
        index: true,
        trim: true,
      },
      state: { type: String, trim: true },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },

    // Embedded Powerful Address Schema (or string for legacy compatibility)
    address: {
      type: Schema.Types.Mixed,
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    locationHistory: [
      {
        address: { type: Schema.Types.Mixed },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        coordinates: {
          lat: Number,
          lng: Number,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    logo: {
      url: String,
      public_id: String,
      resource_type: { type: String, default: "image" },
    },

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

    description: {
      type: String,
      trim: true,
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
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
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Pre-validation synchronization
tourCompanySchema.pre("validate", function (next) {
  const self = this as any;
  if (typeof self.address === "string") {
    const raw = self.address;
    self.address = {
      streetAddress: raw,
      city: self.location?.city || "India",
      state: self.location?.state || "",
      country: self.location?.country || "India",
      formattedAddress: raw,
      location: {
        type: "Point",
        coordinates: [self.coordinates?.lng || 72.8777, self.coordinates?.lat || 19.0760],
      },
    };
  } else if (!self.address && self.location?.city) {
    self.address = {
      streetAddress: "",
      city: self.location.city,
      state: self.location.state || "",
      country: self.location.country || "India",
      formattedAddress: self.location.city,
      location: {
        type: "Point",
        coordinates: [self.coordinates?.lng || 72.8777, self.coordinates?.lat || 19.0760],
      },
    };
  }

  // Sync city, state, country
  if (self.address?.city && (!self.location || !self.location.city)) {
    if (!self.location) self.location = {};
    self.location.city = self.address.city;
  }
  if (self.location?.city && self.address && !self.address.city) {
    self.address.city = self.location.city;
  }
  if (self.address?.state && (!self.location || !self.location.state)) {
    if (!self.location) self.location = {};
    self.location.state = self.address.state;
  }
  if (self.address?.country && (!self.location || !self.location.country)) {
    if (!self.location) self.location = {};
    self.location.country = self.address.country;
  }

  // Sync coordinates
  if (self.coordinates?.lat && self.coordinates?.lng) {
    if (self.address && (!self.address.location || !self.address.location.coordinates?.length)) {
      self.address.location = {
        type: "Point",
        coordinates: [self.coordinates.lng, self.coordinates.lat],
      };
    }
  } else if (self.address?.location?.coordinates?.length === 2) {
    self.coordinates = {
      lat: self.address.location.coordinates[1],
      lng: self.address.location.coordinates[0],
    };
  }

  if (typeof next === "function") {
    next();
  }
});

tourCompanySchema.index({ "location.city": 1, isActive: 1 });
tourCompanySchema.index({ "address.city": 1, "address.areaName": 1, isActive: 1 });
tourCompanySchema.index({ vendorId: 1, createdAt: -1 });
tourCompanySchema.index({
  name: "text",
  description: "text",
  "location.city": "text",
  "address.city": "text",
  "address.areaName": "text",
  "address.district": "text",
  "address.streetAddress": "text",
});

const TourCompany: Model<ITourCompany> = mongoose.model<ITourCompany>("TourCompany", tourCompanySchema);

export default TourCompany;
export { TourCompany, addressSchema };

