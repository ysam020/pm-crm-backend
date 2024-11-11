/**
 * @swagger
 * /api/assign-modules:
 *   put:
 *     summary: Assign modules to a user and send notifications
 *     description: This route assigns one or more modules to a user, stores the modules in Firestore (for real-time updates), and sends a notification to the user's devices via Firebase Cloud Messaging (FCM).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user_name"
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Module1", "Module2"]
 *     responses:
 *       200:
 *         description: Modules assigned successfully and notification sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification sent successfully"
 *       400:
 *         description: User has no FCM tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User has no FCM tokens"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error when assigning modules or sending notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *     tags:
 *       - Admin
 */

import express from "express";
import UserModel from "../../model/userModel.mjs";
import admin from "../../utils/firebaseAdmin.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.put("/api/assign-modules", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const assignee = decoded.username;
    const { modules, username } = req.body;
    const firestore = admin.firestore();

    // Reference to the user's document
    const userDocRef = firestore.collection("modules").doc(username);

    // Reference to the 'moduleName' subcollection
    const moduleRef = userDocRef.collection("moduleName");

    // Use Promise.all to ensure all modules are added
    await Promise.all(
      modules.map(async (moduleName) => {
        if (!moduleName) {
          console.error("Module name is invalid:", moduleName);
          return;
        }

        // Create a document reference for each module inside the moduleName subcollection
        const moduleDocRef = moduleRef.doc(moduleName);

        // Set the module document with any relevant data
        await moduleDocRef.set({
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          // You can add additional fields as necessary
        });
      })
    );

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user modules with unique values
    user.modules = [...new Set([...user.modules, ...modules])];

    await user.save();

    // Ensure the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Notification from ${assignee}`,
        body: `Module assigned: ${modules.join(", ")}`,
        image:
          "https://d1mfah44qwue3n.cloudfront.net/kyc/personal.webp/favicon.png",
      },
      data: {
        LinkUrl: "http://localhost:3000",
      },
    };

    //  Send notifications to each token
    const responses = await Promise.all(
      user.fcmTokens.map(async (token) => {
        try {
          return await admin.messaging().send({ ...payload, token });
        } catch (error) {
          console.error("Error sending notification to token:", token, error);
          return { error }; // Return error for this token
        }
      })
    );

    // Optionally handle responses and log success/errors
    const failedTokens = responses.filter((resp) => resp.error);
    if (failedTokens.length > 0) {
      console.log("Failed to send notifications for tokens:", failedTokens);
    }
    res.status(200).send({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error assigning modules:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
