import { Worker as ThreadWorker } from "worker_threads";
import path from "path";
import connectDB, { connectionCleanup } from "./connectDb.mjs";
import configureApp from "./config/appConfig.mjs";
import { logError } from "./config/loggerConfig.mjs";
import schedule from "node-schedule";
import runESLint from "./utils/runESLint.mjs";
import runDatabaseBackup from "./utils/runDatabaseBackup.mjs";

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

await connectDB().then(async () => {
  connectionCleanup();

  // Function to start worker threads
  function startWorker(workerPath) {
    const worker = new ThreadWorker(workerPath);

    worker.on("message", (msg) => {
      console.log(`[Worker ${workerPath}] Message:`, msg);
    });

    worker.on("error", (err) => {
      console.error(`[Worker ${workerPath}] Error:`, err);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`[Worker ${workerPath}] Exited with code ${code}`);
      }
    });

    return worker;
  }

  // Start worker threads
  startWorker(path.resolve("./workers/emailWorker.mjs"));
  startWorker(path.resolve("./workers/resumeWorker.mjs"));
  startWorker(path.resolve("./workers/watchUserChanges.mjs"));

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

  app.use((err, req) => {
    logError(err, `Error in ${req.method} ${req.url}`, req);
  });

  // Start the server
  server.listen(9002, () => {
    console.log(`BE started at port 9002`);
  });

  // Schedule ESLint to run every day at 8 AM
  schedule.scheduleJob("0 8 * * *", async () => {
    console.log("Running scheduled ESLint check...");
    await runESLint();
  });

  // Schedule the backup job to run every hour
  schedule.scheduleJob("0 * * * *", async () => {
    console.log("Running scheduled MongoDB backup...");
    await runDatabaseBackup();
  });
});
