/**
 * @swagger
 * /api/enable-two-factor:
 *   get:
 *     summary: Enable two-factor authentication
 *     description: Enables two-factor authentication for the user. This generates a twoFactorSecret, a QR code, and backup codes (if not available). It also encrypts the secret and backup codes before saving it to the database.
 *     responses:
 *       200:
 *         description: Successfully enabled two-factor authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Two-factor authentication enabled"
 *                 qrCodeImage:
 *                   type: string
 *                   format: uri
 *                   example: "data:image/png;base64,...."
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "12345678"
 *       404:
 *         description: User not found - If the user doesn't exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - Error enabling two-factor authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while enabling 2FA"
 *     tags:
 *       - Two Factor Authentication (Google Authenticator)
 */

import express from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";
import aesEncrypt from "../utils/aesEncrypt.mjs";
import aesDecrypt from "../utils/aesDecrypt.mjs";

const router = express.Router();

router.get("/api/enable-two-factor", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new secret for 2FA using speakeasy
    const secret = speakeasy.generateSecret({
      name: `Paymaster CRM (${username})`,
    });

    // Encrypt the twoFactorSecret before saving it in the database
    const encryptedSecret = aesEncrypt(secret.base32);

    if (!encryptedSecret) {
      return res.status(500).json({ message: "Encryption failed" });
    }

    user.twoFactorSecret = encryptedSecret;
    user.isTwoFactorEnabled = true;

    // Create a QR code URL and save it to the database
    const qrCodeImage = await QRCode.toDataURL(secret.otpauth_url);
    user.qrCodeImage = qrCodeImage; // Save the QR code image to the user

    // Check if backup codes already exist and have at least one code
    if (!user.backupCodes || user.backupCodes.length === 0) {
      user.generateBackupCodes(); // Generate new backup codes if none exist
    }

    // Include the backup codes in the response
    const decryptedBackupCodes = user.backupCodes.map((encryptedCode) =>
      aesDecrypt(encryptedCode)
    );

    await user.save();

    res.status(200).json({
      message: "Two-factor authentication enabled",
      qrCodeImage,
      backupCodes: decryptedBackupCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while enabling 2FA" });
  }
});

export default router;
