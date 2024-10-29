import express from "express";
import { generateAssertionOptions } from "../../utils/generateAssertionOptions.mjs";

const router = express.Router();

router.post("/api/webauthn/login", async (req, res) => {
  const { username } = req.body;

  try {
    // Generate assertion options for WebAuthn login
    const options = await generateAssertionOptions(username);
    res.json(options);
  } catch (error) {
    console.error("Error generating assertion options:", error);
    res.status(500).json({ error: "Failed to generate assertion options" });
  }
});

export default router;
