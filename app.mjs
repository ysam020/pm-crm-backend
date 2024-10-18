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
import getUserProfile from "./routes/getUserProfile.mjs";
import getUserData from "./routes/getUserData.mjs";
import login from "./routes/login.mjs";
import logout from "./routes/logout.mjs";
import forgotPassword from "./routes/forgotPassword.mjs";
import updatePassword from "./routes/updatePassword.mjs";

// Employee KYC
import completeKyc from "./routes/employee-kyc/completeKyc.mjs";
import kycApproval from "./routes/employee-kyc/kycApproval.mjs";
import viewAllKycs from "./routes/employee-kyc/viewAllKycs.mjs";

// Employee Onboarding
import onboardEmployee from "./routes/employee-onboarding/onboardEmployee.mjs";
import completeOnboarding from "./routes/employee-onboarding/completeOnboarding.mjs";
import viewOnboardings from "./routes/employee-onboarding/viewOnboardings.mjs";

// Home
import assignModules from "./routes/home/assignModules.mjs";
import assignRole from "./routes/home/assignRole.mjs";
import unassignModule from "./routes/home/unassignModules.mjs";
import changePassword from "./routes/home/changePassword.mjs";

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
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
    })
  );
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
          res.send("welcome to the exim backend");
        } catch (error) {
          res.status(500).send("An error occurred while updating the jobs");
        }
      });

      app.use(verifyUser);
      app.use(getUserProfile);
      app.use(getUserData);
      app.use(login);
      app.use(logout);
      app.use(forgotPassword);
      app.use(updatePassword);

      // Employee KYC
      app.use(completeKyc);
      app.use(kycApproval);
      app.use(viewAllKycs);

      // Employee Onboarding
      app.use(onboardEmployee);
      app.use(completeOnboarding);
      app.use(viewOnboardings);

      // Home
      app.use(assignModules);
      app.use(assignRole);
      app.use(unassignModule);
      app.use(changePassword);

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
