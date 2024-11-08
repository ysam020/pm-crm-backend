import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import compression from "compression";
import cluster from "cluster";
import os from "os";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

// Import routes
import verifyUser from "./routes/verifyUser.mjs";
import getUserData from "./routes/getUserData.mjs";
import login from "./routes/login.mjs";
import logout from "./routes/logout.mjs";
import forgotPassword from "./routes/forgotPassword.mjs";
import updatePassword from "./routes/updatePassword.mjs";
import getSessionData from "./routes/getSessionData.mjs";
import logoutFromAllSessions from "./routes/logoutFromAllSessions.mjs";
import resetPassword from "./routes/resetPassword.mjs";
import resetBlockedAccounts from "./routes/resetBlockedAccounts.mjs";
import requestNewBackupCodes from "./routes/requestNewBackupCodes.mjs";
import deleteBackupCodes from "./routes/deleteBackupCodes.mjs";
import enableTwoFactor from "./routes/enableTwoFactor.mjs";
import disableTwoFactor from "./routes/disableTwoFactor.mjs";

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
import sendNotification from "./routes/push-notifications/sendNotification.mjs";
import disablePushNotifications from "./routes/push-notifications/disablePushNotifications.mjs";

// HR & Management
// Job Openings
import addJobOpening from "./routes/hrManagement/job-openings/addJobOpening.mjs";
import viewJobOpenings from "./routes/hrManagement/job-openings/viewJobOpenings.mjs";
import applyForJob from "./routes/hrManagement/job-openings/applyForJob.mjs";
import getJobTitles from "./routes/hrManagement/job-openings/getJobTitles.mjs";
import viewJobOpening from "./routes/hrManagement/job-openings/viewJobOpening.mjs";
import viewApplications from "./routes/hrManagement/job-openings/viewApplications.mjs";
import rejectApplication from "./routes/hrManagement/job-openings/rejectApplication.mjs";
import scheduleInterview from "./routes/hrManagement/job-openings/scheduleInterview.mjs";

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
    console.log(`Worker ${worker.process.pid} died`);
    console.log(`Starting a new worker`);
    cluster.fork();
  });
} else {
  const app = express();

  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://paymaster-crm.s3-website.ap-south-1.amazonaws.com",
        "https://main.dp5y0oxsnhhdp.amplifyapp.com",
        "https://sameer-yadav.site",
        "http://localhost:59291",
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
          console.log(error);
          res.status(500).send("An error occurred");
        }
      });

      app.use(verifyUser);
      app.use(getUserData);
      app.use(login);
      app.use(logout);
      app.use(forgotPassword);
      app.use(updatePassword);
      app.use(getSessionData);
      app.use(logoutFromAllSessions);
      app.use(resetPassword);
      app.use(resetBlockedAccounts);
      app.use(requestNewBackupCodes);
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
      app.use(sendNotification);
      app.use(disablePushNotifications);

      // HR & Management
      // Job Openings
      app.use(addJobOpening);
      app.use(viewJobOpenings);
      app.use(applyForJob);
      app.use(getJobTitles);
      app.use(viewJobOpening);
      app.use(viewApplications);
      app.use(rejectApplication);
      app.use(scheduleInterview);

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
    .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

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
