import { Worker } from "bullmq";
import Redis from "ioredis";
import JobApplicationModel from "../model/jobApplicationModel.mjs";
import processResume from "../utils/parseResume.mjs";

// Create Redis connection with BullMQ-specific options
const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
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

      // Update the application with the calculated score
      await JobApplicationModel.findByIdAndUpdate(
        applicationId,
        { score },
        { new: true }
      );

      return { success: true, applicationId, score };
    } catch (error) {
      console.error("Error in resume processing job:", error);
      throw error; // Throwing will cause the job to fail and potentially retry
    }
  },
  { connection }
);

// Handle worker events
resumeWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default resumeWorker;
