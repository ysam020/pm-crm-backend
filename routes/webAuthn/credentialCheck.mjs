import express from "express";
import User from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/webauthn/credential-check", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username }).select(
      "webAuthnCredentials isTwoFactorEnabled"
    );

    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }

    const isTwoFactorEnabled = user.isTwoFactorEnabled;

    if (
      !user ||
      !user.webAuthnCredentials ||
      user.webAuthnCredentials.length === 0
    ) {
      return res.json({ hasCredentials: false, isTwoFactorEnabled });
    }

    // User has credentials
    res.json({ hasCredentials: true, isTwoFactorEnabled });
  } catch (error) {
    console.error("Error checking credentials:", error);
    res.status(500).json({ error: "Failed to check credentials" });
  }
});

export default router;
