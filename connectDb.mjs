import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

const connectDB = async () => {
  try {
    // Configure mongoose options
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      minPoolSize: 100,
      maxPoolSize: 500,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      family: 4,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

// Clean up MongoDB connection on app termination
export const connectionCleanup = () => {
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to app termination (SIGINT)");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to app termination (SIGTERM)");
    process.exit(0);
  });
};

export default connectDB;
