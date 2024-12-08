import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import sendPushNotifications from "../../../utils/sendPushNotifications.mjs";

const router = express.Router();

router.post("/api/add-warning-memo", verifySession, async (req, res) => {
  try {
    const { username, subject, description } = req.body;

    // Validation: Ensure required fields are provided
    if (!username) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Define the warning memo object
    const warningMemo = {
      subject,
      description,
    };

    // Use findOneAndUpdate to add or update the document
    const updatedUser = await UserModel.findOneAndUpdate(
      { username }, // Filter to find user by username
      {
        $setOnInsert: { username }, // If user does not exist, set username
        $push: { warningMemos: warningMemo }, // Push the new warning memo into the warning memos array
      },
      {
        new: true, // Return the modified document
        upsert: true, // Create a new document if no match is found
      }
    );

    if (!updatedUser.fcmTokens || updatedUser.fcmTokens.length === 0) {
      return res.status(400).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Warning Memo`,
        body: `A warning memo had been issued against you.`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendPushNotifications(updatedUser, payload);

    res.status(201).send({
      message: "Warning memo added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error adding warning memo:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
