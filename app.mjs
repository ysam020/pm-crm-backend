import connectDB, { connectionCleanup } from "./connectDb.mjs";
import configureApp from "./config/appConfig.mjs";
import { logError } from "./config/loggerConfig.mjs";
import schedule from "node-schedule";
import runESLint from "./utils/runESLint.mjs";

import "./workers/resumeWorker.mjs";
import "./workers/emailWorker.mjs";

// Import routes
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

connectDB().then(async () => {
  connectionCleanup();

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
});
