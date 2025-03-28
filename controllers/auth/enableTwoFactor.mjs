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
 *       - Two Factor Authentication
 */

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import UserModel from "../../model/userModel.mjs";

const enableTwoFactor = async (req, res, next) => {
  try {
    const username = req.user.username;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new secret for 2FA using speakeasy
    const secret = speakeasy.generateSecret({
      name: `Paymaster CRM (${username})`,
    });

    // Encrypt the secret for the user
    user.encryptField("twoFactorSecret", secret.base32);
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
      user.decryptField("twoFactorSecret", encryptedCode)
    );

    await user.save();

    res.status(200).json({
      message: "Two-factor authentication enabled",
      qrCodeImage,
      twoFactorSecret: secret.base32,
      backupCodes: decryptedBackupCodes,
    });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "An error occurred while enabling 2FA" });
  }
};

export default enableTwoFactor;
