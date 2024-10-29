import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/webauthn/check", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if webAuthnCredentials is defined and is an array
    const isRegistered =
      Array.isArray(user.webAuthnCredentials) &&
      user.webAuthnCredentials.length > 0;

    return res.status(200).json({ isRegistered });
  } catch (error) {
    console.error("Error checking WebAuthn registration:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
