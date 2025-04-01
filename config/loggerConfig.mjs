import winston from "winston";
import "winston-mongodb";
import dotenv from "dotenv";
import { emailQueue } from "../config/queueConfig.mjs";
import { logErrorTemplate } from "../templates/logErrorTemplate.mjs";
import os from "os";
import mongoose from "mongoose";

dotenv.config();

// Function to get app host (domain or IP)
const getAppHost = () => process.env.APP_URL || os.hostname();

// Function to send error email
const sendErrorEmail = async (
  error,
  description,
  requestDetails,
  systemInfo
) => {
  const timestamp = new Date().toLocaleString();

  // Extract only relevant stack trace (ignore node_modules)
  const stackLines = error.stack
    ?.split("\n")
    .filter((line) => !line.includes("node_modules"))
    .join("<br>");

  const requestInfo = requestDetails
    ? `<b>Method:</b> ${requestDetails.method} <br /> <br />
       <b>URL:</b> ${requestDetails.url} <br /> <br />
       <b>Body:</b> ${requestDetails.body} <br /> <br />`
    : "No request details";

  const html = logErrorTemplate(
    description,
    timestamp,
    error.message,
    stackLines,
    systemInfo.environment,
    systemInfo.hostname,
    requestInfo
  );

  await emailQueue.add(
    "send-mail",
    {
      from: process.env.EMAIL_FROM, // Sender email address (configured in .env)
      to: process.env.DEV_EMAIL, // Recipient email address
      subject: `${systemInfo.environment.toUpperCase()} Error in API -  ${
        requestDetails?.url || ""
      }`,
      html: html, // The email HTML template content
    },
    {
      attempts: 2, // Number of retry attempts if job fails
      backoff: {
        type: "exponential",
        delay: 1000, // 1 second initial delay
      },
    }
  );
};

// Create Winston MongoDB transport
const createMongoTransport = () => {
  return new winston.transports.MongoDB({
    level: "error",
    db: mongoose.connection.getClient(),
    collection: "error_logs",
    tryReconnect: true,
    capped: true,
    cappedMax: 10000,
    decolorize: true,
    handleExceptions: true,
    metaKey: "metadata",
    storeHost: true,
  });
};

// Flag to track if MongoDB transport has been added
let mongoTransportAdded = false;

// Define the logger with MongoDB transport (but no console transport)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [], // No default transports - we'll add MongoDB later
  exitOnError: false,
});

// Add MongoDB transport only when database is connected
mongoose.connection.once("open", async () => {
  if (!mongoTransportAdded) {
    try {
      // Ensure the capped collection exists
      const db = mongoose.connection.db;

      // Check if collection exists
      const collections = await db
        .listCollections({ name: "error_logs" })
        .toArray();

      if (collections.length === 0) {
        // Create capped collection if it doesn't exist
        await db.createCollection("error_logs", {
          capped: true,
          size: 5242880, // 5MB
          max: 10000,
        });
      }

      // Now add the transport
      const mongoTransport = createMongoTransport();
      logger.add(mongoTransport);
      mongoTransportAdded = true;
    } catch (err) {
      console.error("Failed to set up MongoDB logging:", err);
    }
  }
});

// Helper function to log errors
export const logError = (
  error,
  description = "No description provided",
  req = null
) => {
  if (!error) return;

  const systemInfo = {
    environment: process.env.NODE_ENV || "development",
    hostname: os.hostname(),
    appHost: getAppHost(),
  };

  // Extract request details if available
  const requestDetails = req
    ? {
        method: req.method,
        url: req.originalUrl,
        body: JSON.stringify(req.body),
        headers: req.headers,
        ip: req.ip || req.connection.remoteAddress,
      }
    : {};

  const logEntry = {
    message: error.message || "Unknown Error",
    metadata: {
      description,
      stack: error.stack,
      timestamp: new Date(),
      ...systemInfo,
      request: requestDetails,
    },
  };

  // Log to MongoDB via winston (without console output)
  logger.error(logEntry);

  // Create concise format for console.error
  const methodUrl =
    requestDetails?.method && requestDetails?.url
      ? `[${requestDetails.method}] ${requestDetails.url}`
      : "";

  // Get the first line of the stack trace
  const stackFirstLine = error.stack
    ? error.stack.split("\n")[1].trim().split(" ").pop()
    : "";

  // Log to console.error with our concise format
  console.error(
    `Error in ${methodUrl}\nDescription: ${error.message}\nStack Trace: (${stackFirstLine})\n\n`
  );

  // Also send email notification
  sendErrorEmail(error, description, requestDetails, systemInfo);
};
