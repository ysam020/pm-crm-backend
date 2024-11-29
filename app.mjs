import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import compression from "compression";
import cluster from "cluster";
import os from "os";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import helmet from "helmet";

dotenv.config();

// Import routes
import verifyUser from "./routes/verifyUser.mjs";
import getUserData from "./routes/getUserData.mjs";
import login from "./routes/login.mjs";
import logout from "./routes/logout.mjs";
import sendForgotPasswordOtp from "./routes/sendForgotPasswordOtp.mjs";
import updatePassword from "./routes/updatePassword.mjs";
import getSessionData from "./routes/getSessionData.mjs";
import logoutFromAllSessions from "./routes/logoutFromAllSessions.mjs";
import resetPassword from "./routes/resetPassword.mjs";
import resetBlockedAccounts from "./routes/resetBlockedAccounts.mjs";
import requestNewBackupCodes from "./routes/requestNewBackupCodes.mjs";
import deleteBackupCodes from "./routes/deleteBackupCodes.mjs";
import sendBackupCodesMail from "./routes/sendBackupCodesMail.mjs";
import enableTwoFactor from "./routes/enableTwoFactor.mjs";
import disableTwoFactor from "./routes/disableTwoFactor.mjs";

// Uploading Files to AWS S3
import generatePreSignedUrl from "./routes/generatePreSignedUrl.mjs";

// WebAuthn
import credentialCheck from "./routes/webAuthn/credentialCheck.mjs";
import initiateRegistration from "./routes/webAuthn/initiateRegistration.mjs";
import verifyRegistration from "./routes/webAuthn/verifyRegistration.mjs";
import initiateLogin from "./routes/webAuthn/initiateLogin.mjs";
import verifyLogin from "./routes/webAuthn/verifyLogin.mjs";
import webAuthnLogin from "./routes/webAuthn/webAuthnLogin.mjs";
import disableWebAuthn from "./routes/webAuthn/disableWebAuthn.mjs";

// FCM
import saveFcmToken from "./routes/push-notifications/saveFcmToken.mjs";
import disablePushNotifications from "./routes/push-notifications/disablePushNotifications.mjs";

// HR & Management
import getEvents from "./routes/hrManagement/getEvents.mjs";
import getNotifications from "./routes/hrManagement/getNotifications.mjs";
// Appraisal
import addAppraisal from "./routes/hrManagement/appraisal/addAppraisal.mjs";
import viewAppraisals from "./routes/hrManagement/appraisal/viewAppraisals.mjs";
// Training
import addTraining from "./routes/hrManagement/training/addTraining.mjs";
import viewTrainings from "./routes/hrManagement/training/viewTrainings.mjs";
// HR Activities
import addHrActivity from "./routes/hrManagement/hrActivities/addHrActivity.mjs";
import getHrActivities from "./routes/hrManagement/hrActivities/getHrActivities.mjs";
// Job Openings
import addJobOpening from "./routes/hrManagement/job-openings/addJobOpening.mjs";
import viewJobOpenings from "./routes/hrManagement/job-openings/viewJobOpenings.mjs";
import applyForJob from "./routes/hrManagement/job-openings/applyForJob.mjs";
import getJobTitles from "./routes/hrManagement/job-openings/getJobTitles.mjs";
import viewJobOpening from "./routes/hrManagement/job-openings/viewJobOpening.mjs";
import viewApplications from "./routes/hrManagement/job-openings/viewApplications.mjs";
import hireCandidate from "./routes/hrManagement/job-openings/hireCandidate.mjs";
import rejectApplication from "./routes/hrManagement/job-openings/rejectApplication.mjs";
import scheduleInterview from "./routes/hrManagement/job-openings/scheduleInterview.mjs";
// Attendance and Leaves
import addAttendance from "./routes/hrManagement/attendanceAndLeaves/addAttendance.mjs";
import getAttendances from "./routes/hrManagement/attendanceAndLeaves/getAttendances.mjs";
import addLeave from "./routes/hrManagement/attendanceAndLeaves/addLeave.mjs";
import getLeaveApplications from "./routes/hrManagement/attendanceAndLeaves/getLeaveApplications.mjs";
import approveLeave from "./routes/hrManagement/attendanceAndLeaves/approveLeave.mjs";
import getAllAttendances from "./routes/hrManagement/attendanceAndLeaves/getAllAttendances.mjs";

// Employee KYC
import completeKyc from "./routes/employee-kyc/completeKyc.mjs";
import kycApproval from "./routes/employee-kyc/kycApproval.mjs";
import viewAllKycs from "./routes/employee-kyc/viewAllKycs.mjs";

// Employee Onboarding
import onboardEmployee from "./routes/employee-onboarding/onboardEmployee.mjs";
import completeOnboarding from "./routes/employee-onboarding/completeOnboarding.mjs";
import viewOnboardings from "./routes/employee-onboarding/viewOnboardings.mjs";

// Home
import getAllUsers from "./routes/home/getAllUsers.mjs";
import getUserModules from "./routes/home/getUserModules.mjs";
import assignModules from "./routes/home/assignModules.mjs";
import assignRole from "./routes/home/assignRole.mjs";
import unassignModule from "./routes/home/unassignModules.mjs";

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

const numOfCPU = os.availableParallelism();

if (cluster.isPrimary) {
  for (let i = 0; i < numOfCPU; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.error(`Worker ${worker.process.pid} died`);
    console.log(`Starting a new worker`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(helmet());
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://main.dp5y0oxsnhhdp.amplifyapp.com",
        "https://sameer-yadav.site",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.options("*", cors()); // Handle preflight requests

  app.use(compression({ level: 9 }));

  mongoose.set("strictQuery", true);

  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 10,
      maxPoolSize: 1000,
    })
    .then(async () => {
      app.get("/", async (req, res) => {
        try {
          res.send("Server is running on port 9002!");
        } catch (error) {
          console.error(error);
          res.status(500).send("An error occurred");
        }
      });

      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      app.use(generatePreSignedUrl);

      app.use(verifyUser);
      app.use(getUserData);
      app.use(login);
      app.use(logout);
      app.use(sendForgotPasswordOtp);
      app.use(updatePassword);
      app.use(getSessionData);
      app.use(logoutFromAllSessions);
      app.use(resetPassword);
      app.use(resetBlockedAccounts);
      app.use(requestNewBackupCodes);
      app.use(sendBackupCodesMail);
      app.use(deleteBackupCodes);
      app.use(enableTwoFactor);
      app.use(disableTwoFactor);

      // WebAuthn
      app.use(credentialCheck);
      app.use(initiateRegistration);
      app.use(verifyRegistration);
      app.use(initiateLogin);
      app.use(verifyLogin);
      app.use(webAuthnLogin);
      app.use(disableWebAuthn);

      // FCM
      app.use(saveFcmToken);
      app.use(disablePushNotifications);

      // HR & Management
      app.use(getEvents);
      app.use(getNotifications);
      // Appraisal
      app.use(addAppraisal);
      app.use(viewAppraisals);
      // Training
      app.use(addTraining);
      app.use(viewTrainings);
      // HR Activities
      app.use(addHrActivity);
      app.use(getHrActivities);
      // Job Openings
      app.use(addJobOpening);
      app.use(viewJobOpenings);
      app.use(applyForJob);
      app.use(getJobTitles);
      app.use(viewJobOpening);
      app.use(viewApplications);
      app.use(hireCandidate);
      app.use(rejectApplication);
      app.use(scheduleInterview);
      // Attendance and Leaves
      app.use(addAttendance);
      app.use(getAttendances);
      app.use(addLeave);
      app.use(getLeaveApplications);
      app.use(approveLeave);
      app.use(getAllAttendances);

      // Employee KYC
      app.use(completeKyc);
      app.use(kycApproval);
      app.use(viewAllKycs);

      // Employee Onboarding
      app.use(onboardEmployee);
      app.use(completeOnboarding);
      app.use(viewOnboardings);

      // Home
      app.use(getAllUsers);
      app.use(getUserModules);
      app.use(assignModules);
      app.use(assignRole);
      app.use(unassignModule);

      app.listen(9002, () => {
        console.log(`BE started at port 9002`);
      });
    })
    .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to app termination");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed due to app termination");
    process.exit(0);
  });
}
