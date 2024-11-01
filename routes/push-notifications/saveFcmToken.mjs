import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/save-fcm-token", verifySession, async (req, res) => {
  const { username, fcmToken } = req.body;

  // Find the user by username
  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(200).send({ message: "User not found" });
  }

  // Add the token to the array if it doesn't already exist
  if (!user.fcmTokens.includes(fcmToken)) {
    user.fcmTokens.push(fcmToken);
  }

  await user.save();
  res.send({ message: "Push notification enabled" });
});

export default router;
