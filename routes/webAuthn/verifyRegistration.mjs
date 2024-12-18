/**
 * @swagger
 * /api/webauthn-verify-registration:
 *   post:
 *     summary: Verify WebAuthn attestation response for registration
 *     description: This route verifies the WebAuthn attestation response during the registration process. It checks whether the provided WebAuthn credentials match the user's credentials, allowing them to successfully complete registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: object
 *                 description: The WebAuthn attestation response sent from the client during registration.
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "f6ad61f94d0f25b8d05e32a3b8b3cbe7"
 *                   rawId:
 *                     type: string
 *                     example: "6d417d0e54eb14b28bc4c9b61801b7d1"
 *                   response:
 *                     type: object
 *                     properties:
 *                       clientDataJSON:
 *                         type: string
 *                         example: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9"
 *                       attestationObject:
 *                         type: string
 *                         example: "MEUCIQDf6CZ7y8P-ovNcTmCGRfiVbrrT13..."
 *     responses:
 *       200:
 *         description: Successfully verified the WebAuthn attestation response and completed registration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *       500:
 *         description: Internal server error. Failed to verify the attestation response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to verify attestation response"
 *     tags:
 *       - WebAuthn
 */

import express from "express";
import { verifyAttestationResponse } from "../../utils/verifyAttestationResponse.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/webauthn-verify-registration",
  verifySession,
  async (req, res) => {
    try {
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.username;
      const { credential } = req.body;
      const data = await verifyAttestationResponse(username, credential);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error verifying attestation response:", error);
      res
        .status(500)
        .json({ message: "Failed to verify attestation response" });
    }
  }
);

export default router;
