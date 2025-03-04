import { Worker } from "bullmq";
import Redis from "ioredis";
import transporter from "../utils/transporter.mjs";
import dotenv from "dotenv";

dotenv.config();

// Create Redis connection with BullMQ-specific options
const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false, // Recommended for BullMQ
});

// Create a worker to process resume jobs
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM, // Sender email address (configured in .env)
        to: to, // Recipient email address
        subject: subject,
        html: html,
      });
    } catch (err) {
      console.error("Error sending email with Nodemailer:", err);
    }
  },
  {
    connection,
  }
);

// Handle worker events
emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default emailWorker;
