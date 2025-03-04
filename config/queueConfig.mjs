import { Queue } from "bullmq";
import Redis from "ioredis";

// Create Redis connection with BullMQ-specific options
const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false, // Recommended for BullMQ
});

// Create a queue for resume processing tasks
export const resumeQueue = new Queue("resumeProcessing", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // Remove jobs from queue when completed
    removeOnFail: 100, // Keep the last 100 failed jobs
  },
});

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // Remove jobs from queue when completed
    removeOnFail: 100, // Keep the last 100 failed jobs
  },
});
