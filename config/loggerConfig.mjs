import winston from "winston";
import "winston-mongodb";
import dotenv from "dotenv";
import { emailQueue } from "../config/queueConfig.mjs";
import { logErrorTemplate } from "../templates/logErrorTemplate.mjs";
import os from "os";

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
      subject: `[${systemInfo.environment.toUpperCase()}] Error in API -  ${
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

// Define the logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.MongoDB({
      level: "error",
      db: process.env.DEV_MONGODB_URI,
      collection: "error_logs",
      tryReconnect: true,
      capped: true,
      cappedMax: 10000,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, metadata }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} \nStack: ${
            metadata?.stack || "N/A"
          }\n`;
        })
      ),
    }),
  ],
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

  logger.error(logEntry);
  sendErrorEmail(error, description, requestDetails, systemInfo);
};

export default logger;
