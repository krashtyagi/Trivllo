import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserProviders {
  local: {
    isVerified: boolean;
  };
  google?: {
    id?: string;
    email?: string;
  };
  facebook?: {
    id?: string;
    email?: string;
  };
  apple?: {
    id?: string;
    email?: string;
  };
}

export interface IDeleteRequest {
  status: "none" | "pending";
  requestedAt?: Date;
  reason?: string;
}

export interface IUser extends Document {
  email?: string;
  password?: string;
  role: "user" | "vendor" | "admin" | "super_admin" | "blog_author" | "blog_editor" | "seo_manager" | "reviewer";
  isVendor: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender: "male" | "female" | "other";
  dob?: Date;
  country: string;
  avatar?: string;
  address?: string;
  zipcCode?: string;
  providers: IUserProviders;
  otp?: string;
  otpExpires?: Date;
  otpAttempts: number;
  signupExpires?: Date;
  deleteRequest: IDeleteRequest;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      // required: [true, "Email is required"],
      // unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: [
        "user",
        "vendor",
        "admin",
        "super_admin",
        "blog_author",
        "blog_editor",
        "seo_manager",
        "reviewer",
      ],
      default: "user",
    },
    isVendor: {
      type: Boolean,
      default: false,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phoneNumber: { type: String, unique: true, trim: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dob: { type: Date },
    country: { type: String, default: "India" },
    avatar: { type: String },
    address: { type: String, trim: true },
    zipcCode: { type: String, trim: true },
    providers: {
      local: {
        isVerified: { type: Boolean, default: false },
      },
      google: { id: String, email: String },
      facebook: { id: String, email: String },
      apple: { id: String, email: String },
    },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    signupExpires: {
      type: Date,
      select: false,
    },

    deleteRequest: {
      status: {
        type: String,
        enum: ["none", "pending"],
        default: "none",
      },
      requestedAt: Date,
      reason: {
        type: String,
        trim: true,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    throw error;
  }
});

// Sync password hash to Better Auth account collection whenever user is saved
userSchema.post("save", async function (doc) {
  if (doc?.password) {
    try {
      const db = mongoose.connection.db;
      if (db) {
        const userIdStr = doc._id.toString();
        await db.collection("account").updateOne(
          {
            $or: [
              { userId: userIdStr, providerId: "credential" },
              { userId: doc._id, providerId: "credential" },
            ],
          },
          {
            $set: {
              userId: userIdStr,
              accountId: userIdStr,
              providerId: "credential",
              password: doc.password,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: doc.createdAt || new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (syncErr: any) {
      console.error("Failed to sync Better Auth account on user save:", syncErr?.message || syncErr);
    }
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
