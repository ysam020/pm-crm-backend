import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/save-fcm-token", verifySession, async (req, res) => {
  try {
    const { username, fcmToken } = req.body;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" }); // Changed status code to 404
    }

    // Add the token to the array if it doesn't already exist
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    await user.save();
    res.send({ message: "Push notification enabled" });
  } catch (error) {
    console.error("Error saving FCM token:", error); // Log the error for debugging
    res
      .status(500)
      .send({
        message:
          "An error occurred while saving the FCM token. Please try again later.",
      }); // Send a user-friendly error message
  }
});

export default router;
