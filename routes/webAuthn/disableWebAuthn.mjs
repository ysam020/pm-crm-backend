import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/disable-webauthn", verifySession, async (req, res) => {
  const { username } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    user.webAuthnCredentials = [];
    user.isWebAuthnEnabled = false;
    await user.save();
    res.json({ message: "WebAuthn disabled" });
  } catch (error) {
    console.error("Error disabling WebAuthn:", error);
    res.status(500).json({ message: "Failed to disable WebAuthn" });
  }
});

export default router;
