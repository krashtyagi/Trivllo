import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Helper to get MongoDB database instance from Mongoose or URI
function getDbInstance() {
  const { MongoClient } = mongoose.mongo;
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/trivllo";
  const client = new MongoClient(mongoUri);
  return { client, db: client.db() };
}

const { client, db } = getDbInstance();

export const auth = betterAuth({
  plugins: [bearer()],
  database: mongodbAdapter(db, { client }),

  secret: process.env.BETTER_AUTH_SECRET || "fallback_development_secret_key_change_in_prod",

  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  basePath: "/api/auth",

  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.VENDOR_URL || "http://localhost:3001",
    process.env.ADMIN_URL || "http://localhost:3002",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "https://trivllo.com",
    "https://www.trivllo.com",
    "https://admin.trivllo.com",
    "https://partner.trivllo.com",
  ],

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => bcrypt.hash(password, 12),
      verify: async ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "apple", "facebook"],
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: true,
      },
      isVendor: {
        type: "boolean",
        defaultValue: false,
      },
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

