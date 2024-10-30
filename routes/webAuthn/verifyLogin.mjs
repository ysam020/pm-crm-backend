import express from "express";
import { verifyAssertionResponse } from "../../utils/verifyAssertionResponse.mjs";

const router = express.Router();

router.post("/api/webauthn/verify-login", async (req, res) => {
  const { username, credential } = req.body;

  try {
    // Verify assertion response during WebAuthn login
    const loginResponse = await verifyAssertionResponse(username, credential);

    res.json(loginResponse);
  } catch (error) {
    console.error("Error verifying assertion response:", error);
    res.status(500).json({ error: "Failed to verify assertion response" });
  }
});

export default router;
