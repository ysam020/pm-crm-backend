import UserModel from "../../model/userModel.mjs";
import sendPushNotifications from "../../utils/sendPushNotifications.mjs";
import { cacheResponse } from "../../utils/cacheResponse.mjs";

const addWarningMemo = async (req, res) => {
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
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error adding warning memo:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default addWarningMemo;
