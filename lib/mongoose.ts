import mongoose from "mongoose";

// Get MONGODB_URI lazily to avoid errors during build time
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  return uri;
};

type MongooseConnection = typeof mongoose | null;

declare global {
  // eslint-disable-next-line no-var
  var __MONGOOSE_CONN__: {
    conn: MongooseConnection;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.__MONGOOSE_CONN__ || { conn: null, promise: null };

export async function connectToDatabase() {
  // If already connected, return the connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      // If connection failed, clear the promise and try again
      cached.promise = null;
      throw error;
    }
  }

  // Create new connection with timeout and retry
  const MONGODB_URI = getMongoUri();
  cached.promise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000, // 10 second timeout (increased for Atlas)
    socketTimeoutMS: 45000, // 45 second socket timeout
    connectTimeoutMS: 15000, // 15 second connection timeout (increased for Atlas)
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain at least 2 socket connections
    retryWrites: true,
    retryReads: true,
  });

  try {
    cached.conn = await cached.promise;
    global.__MONGOOSE_CONN__ = cached;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    
    // Provide helpful error messages
    if (error.name === 'MongoServerSelectionError') {
      throw new Error("Cannot connect to MongoDB. Please check if MongoDB is running and the connection string is correct.");
    }
    if (error.name === 'MongoNetworkError') {
      throw new Error("Network error connecting to MongoDB. Please check your internet connection and MongoDB server.");
    }
    if (error.name === 'MongoAuthenticationError') {
      throw new Error("MongoDB authentication failed. Please check your username and password.");
    }
    
    throw error;
  }
}
