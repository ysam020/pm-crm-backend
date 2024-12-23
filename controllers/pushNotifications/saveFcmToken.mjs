import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const saveFcmToken = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const { fcmToken } = req.body;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Add the token to the array if it doesn't already exist
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    await user.save();
    res.status(200).send({ message: "Push notification enabled" });
  } catch (error) {
    console.error("Error saving FCM token:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while saving the FCM token. Please try again later",
    });
  }
};

export default saveFcmToken;
