import admin from "../config/firebaseAdmin.mjs";
import UserModel from "../model/userModel.mjs";

async function sendPushNotifications(user, payload) {
  if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
    return;
  }

  let failedTokens = new Set();

  // 🚀 Step 1: Attempt to send notifications
  await Promise.allSettled(
    user.fcmTokens.map(async (token) => {
      try {
        await admin.messaging().send({ ...payload, token });
      } catch (error) {
        // Add failed token to the list if it is invalid or unregistered
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

    await UserModel.findByIdAndUpdate(
      user._id,
      { fcmTokens: validTokens },
      { new: true }
    );
  }
}

export default sendPushNotifications;
