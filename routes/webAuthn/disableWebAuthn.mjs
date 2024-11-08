import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from 'jsonwebtoken'

const router = express.Router();

router.get("/api/disable-webauthn", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    console.log("username", username);
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    user.webAuthnCredentials = [];
    await user.save();
    res.json({ message: "WebAuthn disabled" });
  } catch (error) {
    console.error("Error disabling WebAuthn:", error);
    res.status(500).json({ message: "Failed to disable WebAuthn" });
  }
});

export default router;
