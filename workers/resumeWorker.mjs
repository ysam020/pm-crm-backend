import { parentPort } from "worker_threads";
import { Worker } from "bullmq";
import Redis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";
import JobApplicationModel from "../model/jobApplicationModel.mjs";
import processResume from "../utils/parseResume.mjs";

dotenv.config();

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

// Ensure MongoDB connection in the worker
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    await mongoose.connect(MONGODB_URI, {
      minPoolSize: 10,
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      family: 4,
      compressors: "zstd",
    });
  } catch (error) {
    console.error("[resumeWorker] MongoDB Connection Error:", error);
    process.exit(1); // Exit worker if DB connection fails
  }
};

await connectDB();

// Create Redis connection with BullMQ-specific options
const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false, // Recommended for BullMQ
});

// Create a worker to process resume jobs
const resumeWorker = new Worker(
  "resumeProcessing",
  async (job) => {
    try {
      const { applicationId, requiredExperience, requiredSkills } = job.data;

      // Process the resume and get the score
      const score = await processResume(
        "../../Resume.pdf",
        requiredExperience,
        requiredSkills
      );

      // Ensure Mongoose is connected before proceeding
      if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB not connected in worker");
      }

      // Update the application with the calculated score
      await JobApplicationModel.findByIdAndUpdate(
        applicationId,
        { score },
        { new: true }
      );

      parentPort?.postMessage(
        `Resume processed for application ${applicationId} with score ${score}`
      );

      return { success: true, applicationId, score };
    } catch (error) {
      console.error("[resumeWorker] Error in resume processing job:", error);
      parentPort?.postMessage(`Resume processing failed: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

// Handle worker events
resumeWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
  parentPort?.postMessage(`Job ${job.id} failed: ${err.message}`);
});
