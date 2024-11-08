import express from "express";
import { verifyAttestationResponse } from "../../utils/verifyAttestationResponse.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from 'jsonwebtoken'

const router = express.Router();

router.post(
  "/api/webauthn/verify-registration",
  verifySession,
  async (req, res) => {
    try {
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.username;
      const { credential } = req.body;
      const data = await verifyAttestationResponse(username, credential);
      res.json(data);
    } catch (error) {
      console.error("Error verifying attestation response:", error);
      res.status(500).json({ error: "Failed to verify attestation response" });
    }
  }
);

export default router;
