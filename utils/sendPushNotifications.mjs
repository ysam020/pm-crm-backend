import admin from "./firebaseAdmin.mjs";

async function sendPushNotifications(user, payload) {
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
    console.error("Failed to send notifications for tokens:", failedTokens);
  }
}

export default sendPushNotifications;
