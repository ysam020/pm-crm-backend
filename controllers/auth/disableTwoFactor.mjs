import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const disableTwoFactor = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Disable two-factor authentication
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.qrCodeImage = null;

    await user.save();
    res.send({ message: "Two factor authentication disabled" });
  } catch (error) {
    console.error("Error disabling two-factor authentication:", error);
    res
      .status(500)
      .send({ message: "Failed to disable two-factor authentication" }); // 500 for server error
  }
};

export default disableTwoFactor;
