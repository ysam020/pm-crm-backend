import { parentPort } from "worker_threads";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "../model/userModel.mjs";
import { cacheResponse } from "../utils/cacheResponse.mjs";

dotenv.config();

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

// Ensure MongoDB connection in the worker
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    await mongoose.connect(MONGODB_URI, {
      minPoolSize: 100,
      maxPoolSize: 500,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      family: 4,
      compressors: "zstd",
    });
  } catch (error) {
    console.error("[watchUserWorker] MongoDB Connection Error:", error);
    process.exit(1); // Exit worker if DB connection fails
  }
};

// Function to watch user collection for changes
const watchUserChanges = async () => {
  try {
    const changeStream = UserModel.watch();

    changeStream.on("change", async (change) => {
      const userId = change.documentKey._id;

      // Always update KYC cache, even if user is deleted
      const kycUsers = await UserModel.find(
        {},
        "first_name middle_name last_name username email kyc_approval"
      );
      await cacheResponse("kyc_records", kycUsers.reverse());

      // Fetch user details only if NOT a delete operation
      if (change.operationType !== "delete") {
        const user = await UserModel.findById(userId).select(
          "username rank first_name middle_name last_name employee_photo email modules dob blood_group official_email mobile communication_address_line_1 communication_address_line_2 communication_address_city communication_address_state communication_address_pincode permanent_address_line_1 permanent_address_line_2 permanent_address_city permanent_address_state permanent_address_pincode designation department joining_date bank_account_no bank_name ifsc_code aadhar_no aadhar_photo_front pan_no pan_photo pf_no esic_no backupCodes isTwoFactorEnabled qrCodeImage twoFactorSecret"
        );

        if (user) {
          const full_name = user.getFullName();
          await cacheResponse(`user:${user.username}`, {
            ...user.toObject(),
            full_name,
          });

          // Fetch user data in required format for `getUserData`
          const userData = await UserModel.findOne({
            username: user.username,
          }).select(
            "-password -sessions -resetPasswordOTP -resetPasswordExpires -failedLoginAttempts -firstFailedLoginAt -isBlocked -blockedUntil -isTwoFactorEnabled -twoFactorSecret -qrCodeImage -backupCodes -webAuthnCredentials -fcmTokens"
          );

          if (userData) {
            await cacheResponse(`userData:${user.username}`, {
              ...userData.toObject(),
              full_name,
            });
          }
        }
      }
    });

    changeStream.on("error", (error) => {
      console.error("[watchUserWorker] Change Stream Error:", error);
      parentPort?.postMessage(`Change Stream Error: ${error.message}`);
    });
  } catch (error) {
    console.error("[watchUserWorker] Error setting up Change Stream:", error);
    process.exit(1);
  }
};

// Connect to DB and start watching changes
await connectDB();
await watchUserChanges();
