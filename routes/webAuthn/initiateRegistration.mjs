import express from "express";
import { generateAttestationOptions } from "../../utils/generateAttestationOptions.mjs";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/webauthn/register", verifySession, async (req, res) => {
  const { username } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    await user.save();
    const options = await generateAttestationOptions(username);
    res.json(options);
  } catch (error) {
    console.error("Error generating attestation options:", error);
    res.status(500).json({ error: "Failed to generate attestation options" });
  }
});

export default router;
