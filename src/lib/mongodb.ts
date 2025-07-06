import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: null | typeof mongoose;
    promise: null | Promise<typeof mongoose>;
  };
}

// Initialize global mongoose
if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

// MongoDB connection URI - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmkeeper';

export async function connectToDatabase() {
  if (global.mongoose.conn) {
    return { conn: global.mongoose.conn };
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return { conn: global.mongoose.conn };
}

// Disconnect from MongoDB - useful for testing and cleanup
export async function disconnectFromDatabase() {
  if (global.mongoose.conn) {
    await global.mongoose.conn.disconnect();
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }
}
