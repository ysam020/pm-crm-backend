import UserModel from "../model/userModel.mjs";
import admin from "firebase-admin";

async function sendDepartmentPushNotifications(
  username,
  department,
  rank,
  payload
) {
  try {
    // Fetch users in the department, excluding the sender
    const users = await UserModel.find({
      department,
      username: { $ne: username },
      rank: { $lte: rank },
    });

    if (!users.length) return;

    let updates = []; // To store users whose FCM tokens need updating

    const notificationPromises = users.map(async (user) => {
      if (!user.fcmTokens || user.fcmTokens.length === 0) return;

      let failedTokens = new Set();

      // 🚀 Send notifications to all tokens
      await Promise.allSettled(
        user.fcmTokens.map(async (token) => {
          try {
            await admin.messaging().send({ ...payload, token });
          } catch (error) {
            // Add token to failed list if it's invalid or unregistered
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              failedTokens.add(token);
            }
          }
        })
      );

      // Step 2: Remove failed tokens and update user in DB
      if (failedTokens.size > 0) {
        const validTokens = user.fcmTokens.filter(
          (token) => !failedTokens.has(token)
        );
        updates.push(
          UserModel.findByIdAndUpdate(
            user._id,
            { fcmTokens: validTokens },
            { new: true }
          )
        );
      }
    });

    // Wait for all notification and database updates
    await Promise.allSettled([...notificationPromises, ...updates]);

    console.log("[SUCCESS] Push notifications sent. Expired tokens removed.");
  } catch (error) {
    console.error(
      "[FATAL ERROR] sendDepartmentPushNotifications failed:",
      error
    );
  }
}

export default sendDepartmentPushNotifications;
