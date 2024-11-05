import express from "express";
import UserModel from "../../model/userModel.mjs";
import admin from "../../utils/firebaseAdmin.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/send-notification", verifySession, async (req, res) => {
  try {
    const { username, message } = req.body;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Ensure the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Notification from ${username}`,
        body: message,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/favicon.png",
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

    res.send({ message: "Notification sent successfully", responses });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ message: "Error sending notification", error });
  }
});

export default router;
