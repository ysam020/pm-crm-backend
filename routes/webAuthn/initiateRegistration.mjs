import express from "express";
import { generateAttestationOptions } from "../../utils/generateAttestationOptions.mjs";

const router = express.Router();

router.post("/api/webauthn/register", async (req, res) => {
  const { username } = req.body;

  try {
    const options = await generateAttestationOptions(username);
    res.json(options);
  } catch (error) {
    console.error("Error generating attestation options:", error);
    res.status(500).json({ error: "Failed to generate attestation options" });
  }
});

export default router;
