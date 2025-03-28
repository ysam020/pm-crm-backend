/**
 * @swagger
 * /api/add-warning-memo:
 *   post:
 *     summary: Add a warning memo for a user
 *     description: This route allows adding a warning memo to a user. It checks if required fields are provided and sends a push notification to the user if they have an FCM token. A valid session token must be included for authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               subject:
 *                 type: string
 *                 example: "Late Attendance"
 *               description:
 *                 type: string
 *                 example: "Employee has been marked absent for 5 consecutive days."
 *     responses:
 *       201:
 *         description: Successfully added the warning memo to the user's record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Warning memo added successfully"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized, No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal server error if something goes wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Warning Memo
 */

import WaningModel from "../../model/warningModel.mjs";
import sendPushNotifications from "../../utils/sendPushNotifications.mjs";
import { cacheResponse } from "../../utils/cacheResponse.mjs";

const addWarningMemo = async (req, res, next) => {
  try {
    const { username, subject, description } = req.body;

    // Validation: Ensure required fields are provided
    if (!username || !subject || !description) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Define the warning memo object
    const warningMemo = {
      subject,
      description,
    };

    // Use findOneAndUpdate to add or update the document
    const updatedUser = await WaningModel.findOneAndUpdate(
      { _id: req.user._id }, // Filter to find user by username
      {
        $setOnInsert: { _id: req.user._id, username: req.user.username }, // If user does not exist, set username
        $push: { warningMemos: warningMemo }, // Push the new training into the training array
      },
      {
        new: true, // Return the modified document
        upsert: true, // Create a new document if no match is found
      }
    );

    // Check if the user has FCM tokens. If not, skip sending the push notification.
    if (updatedUser.fcmTokens && updatedUser.fcmTokens.length > 0) {
      // Prepare the push notification payload
      const payload = {
        notification: {
          title: `Warning Memo`,
          body: `A warning memo has been issued against you.`,
          image:
            "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
        },
      };

      // Send push notification to the user
      await sendPushNotifications(updatedUser, payload);
    }

    // Update the cache for warning memos
    const cacheKey = `warningMemos:${username}`;
    const updatedWarningMemos = updatedUser.warningMemos;
    await cacheResponse(cacheKey, updatedWarningMemos);

    res.status(201).send({
      message: "Warning memo added successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addWarningMemo;
