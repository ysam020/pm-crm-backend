import connectDB, { connectionCleanup } from "./connectDb.mjs";
import { setupChangeStream } from "./cs.mjs";
import configureApp from "./config/appConfig.mjs";
// Import routes
import generalRoutes from "./routes/generalRoutes.mjs";
// Auth
import authRoutes from "./routes/authRoutes.mjs";
// WebAuthn
import webauthnRoutes from "./routes/webauthnRoutes.mjs";
// FCM
import pushNotificationRoutes from "./routes/pushNotificationRoutes.mjs";
// User Management
import userRoutes from "./routes/userRoutes.mjs";
// HR
import appraisalRoutes from "./routes/appraisalRoutes.mjs";
import trainingRoutes from "./routes/trainingRoutes.mjs";
import hrActivityRoutes from "./routes/hrActivityRoutes.mjs";
import warningMemoRoutes from "./routes/warningMemoRoutes.mjs";
import recruitmentRoutes from "./routes/recruitmentRoutes.mjs";
import attendanceRoutes from "./routes/attendanceRoutes.mjs";
import kycRoutes from "./routes/kycRoutes.mjs";
import resignationRoutes from "./routes/resignationRoutes.mjs";

const { app, server } = configureApp();

connectDB().then((mongooseConnection) => {
  connectionCleanup();
  setupChangeStream(mongooseConnection);

  // General
  app.use(generalRoutes);
  // Auth
  app.use(authRoutes);
  // WebAuthn
  app.use(webauthnRoutes);
  // User Management
  app.use(userRoutes);
  // FCM
  app.use(pushNotificationRoutes);
  // HR
  app.use(appraisalRoutes);
  app.use(trainingRoutes);
  app.use(hrActivityRoutes);
  app.use(warningMemoRoutes);
  app.use(recruitmentRoutes);
  app.use(attendanceRoutes);
  app.use(kycRoutes);
  app.use(resignationRoutes);

  server.listen(9002, () => {
    console.log(`BE started at port 9002`);
  });
});
