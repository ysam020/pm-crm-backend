/**
 * @swagger
 * components:
 *   schemas:
 *     UnblockUsersJob:
 *       type: object
 *       properties:
 *         jobScheduled:
 *           type: string
 *           example: "Job scheduled successfully. Will run daily at 12:00 AM"
 *         jobStatus:
 *           type: string
 *           example: "No users to unblock."
 *       description: Information about the scheduled job for unblocking users.
 *
 * @swagger
 * tags:
 *   - name: Admin
 */

import express from "express";
import schedule from "node-schedule";
import UserModel from "../model/userModel.mjs";

const router = express.Router();

// Schedule job to run every day at 12:00 AM
schedule.scheduleJob("0 0 * * *", async () => {
  // Schedule job to run every 10 seconds (in development)
  // schedule.scheduleJob("*/10 * * * * *", async () => {
  try {
    const now = new Date();

    // Find users where `isBlocked` is true and `blockedUntil` is in the past or today
    const usersToUnblock = await UserModel.find({
      isBlocked: true,
      blockedUntil: { $lte: now },
    });

    if (usersToUnblock.length > 0) {
      // Reset isBlocked to false, failedLoginAttempts to 0, and remove blockedUntil & firstFailedLoginAt
      await UserModel.updateMany(
        { _id: { $in: usersToUnblock.map((user) => user._id) } },
        {
          $set: { isBlocked: false, failedLoginAttempts: 0 },
          $unset: { blockedUntil: 1, firstFailedLoginAt: 1 },
        }
      );
    } else {
      console.log("No users to unblock.");
    }
  } catch (err) {
    console.log("Error unblocking users: ", err);
  }
});

export default router;
