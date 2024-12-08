import UserModel from "../model/userModel.mjs";
import admin from "firebase-admin";

async function sendDepartmentPushNotifications(
  username,
  department,
  rank,
  payload
) {
  // Find all users in the same department (excluding the current user)
  const users = await UserModel.find({
    department,
    username: { $ne: username },
    rank: { $lte: rank },
  });

  const notificationPromises = users.flatMap((user) =>
    user.fcmTokens.map(async (token) => {
      try {
        // Send notification using Firebase Admin SDK
        return await admin.messaging().send({ ...payload, token });
      } catch (error) {
        console.error("Error sending notification to token:", token, error);
        return { token, error }; // Return error details for this token
      }
    })
  );

  // Wait for all notifications to be sent
  await Promise.all(notificationPromises);
}

export default sendDepartmentPushNotifications;
