import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/disable-webauthn", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ error: "User not found" });
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
