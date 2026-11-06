import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCached: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCached || {
  conn: null,
  promise: null,
};

if (!global.mongooseCached) {
  global.mongooseCached = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error(
      "Please define the MONGO_URI environment variable inside your environment variables."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { mongoose };

