import express from "express";
import { verifyAttestationResponse } from "../../utils/verifyAttestationResponse.mjs";

const router = express.Router();

router.post("/api/webauthn/verify-registration", async (req, res) => {
  const { username, credential } = req.body;

  try {
    const data = await verifyAttestationResponse(username, credential);
    res.json(data);
  } catch (error) {
    console.error("Error verifying attestation response:", error);
    res.status(500).json({ error: "Failed to verify attestation response" });
  }
});

export default router;
