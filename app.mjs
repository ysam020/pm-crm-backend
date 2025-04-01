import { Worker as ThreadWorker } from "worker_threads";
import path from "path";
import connectDB, { connectionCleanup } from "./connectDb.mjs";
import configureApp from "./config/appConfig.mjs";
import { logError } from "./config/loggerConfig.mjs";
import schedule from "node-schedule";
import runESLint from "./utils/runESLint.mjs";
import runDatabaseBackup from "./utils/runDatabaseBackup.mjs";
import {
  setupGlobalErrorHandlers,
  handleStartupError,
} from "./utils/globalErrorHandler.mjs";

// Set up global error handlers at the very beginning
setupGlobalErrorHandlers();

// Routes
import generalRoutes from "./routes/generalRoutes.mjs";
import analyticsRoute from "./routes/analyticsRoute.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import webauthnRoutes from "./routes/webauthnRoutes.mjs";
import pushNotificationRoutes from "./routes/pushNotificationRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import appraisalRoutes from "./routes/appraisalRoutes.mjs";
import trainingRoutes from "./routes/trainingRoutes.mjs";
import hrActivityRoutes from "./routes/hrActivityRoutes.mjs";
import warningMemoRoutes from "./routes/warningMemoRoutes.mjs";
import recruitmentRoutes from "./routes/recruitmentRoutes.mjs";
import attendanceRoutes from "./routes/attendanceRoutes.mjs";
import kycRoutes from "./routes/kycRoutes.mjs";
import resignationRoutes from "./routes/resignationRoutes.mjs";

const { app, server } = configureApp();

// Wrap the main application logic in an async function
async function startApplication() {
  try {
    await connectDB().then(async () => {
      connectionCleanup();

      // Function to start worker threads with error handling
      function startWorker(workerPath) {
        try {
          const worker = new ThreadWorker(workerPath);

          worker.on("message", (msg) => {
            console.log(`[Worker ${workerPath}] Message:`, msg);
          });

          worker.on("error", (err) => {
            console.error(`[Worker ${workerPath}] Error:`, err);
            logError(err, `Error in worker ${workerPath}`, null);
          });

          worker.on("exit", (code) => {
            if (code !== 0) {
              const workerExitError = new Error(
                `Worker exited with code ${code}`
              );
              console.error(`[Worker ${workerPath}] Exited with code ${code}`);
              logError(
                workerExitError,
                `Worker ${workerPath} exited abnormally`,
                null
              );
            }
          });

          return worker;
        } catch (error) {
          logError(error, `Failed to start worker ${workerPath}`, null);
          throw error; // Rethrow to be caught by the outer try/catch
        }
      }

      // Start worker threads
      try {
        startWorker(path.resolve("./workers/emailWorker.mjs"));
        startWorker(path.resolve("./workers/resumeWorker.mjs"));
        startWorker(path.resolve("./workers/watchUserChanges.mjs"));
      } catch (workerError) {
        console.error("Error starting worker threads:", workerError);
      }

      // Set up routes
      app.use(generalRoutes);
      app.use(analyticsRoute);
      app.use(authRoutes);
      app.use(webauthnRoutes);
      app.use(userRoutes);
      app.use(pushNotificationRoutes);
      app.use(appraisalRoutes);
      app.use(trainingRoutes);
      app.use(hrActivityRoutes);
      app.use(warningMemoRoutes);
      app.use(recruitmentRoutes);
      app.use(attendanceRoutes);
      app.use(kycRoutes);
      app.use(resignationRoutes);

      // Error handling middleware (should be after all routes)
      app.use((err, req, res, next) => {
        logError(err, `Error in ${req.method} ${req.url}`, req);

        // Send a response to the client
        res.status(500).json({
          status: "error",
          message: "An error occurred processing your request",
        });
      });

      // Start the server
      server.listen(9002, () => {
        console.log(`BE started at port 9002`);
      });

      // Schedule ESLint to run every day at 8 AM
      schedule.scheduleJob("0 8 * * *", async () => {
        try {
          await runESLint();
        } catch (eslintError) {
          logError(eslintError, "Error in scheduled ESLint job", null);
        }
      });

      // Schedule the backup job to run every
      schedule.scheduleJob("0 * * * *", async () => {
        try {
          await runDatabaseBackup();
        } catch (backupError) {
          logError(backupError, "Error in scheduled MongoDB backup job", null);
        }
      });
    });
  } catch (error) {
    handleStartupError(error);
  }
}

// Start the application
startApplication().catch(handleStartupError);
