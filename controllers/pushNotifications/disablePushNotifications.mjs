import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const disablePushNotifications = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.fcmTokens = [];
    await user.save();
    res.status(200).send({ message: "Push notification disabled" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to disable push notifications" });
  }
};

export default disablePushNotifications;
