import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const disableWebAuthn = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.webAuthnCredentials = [];
    await user.save();
    res.status(200).json({ message: "WebAuthn disabled" });
  } catch (error) {
    console.error("Error disabling WebAuthn:", error);
    res.status(500).json({ message: "Failed to disable WebAuthn" });
  }
};

export default disableWebAuthn;
