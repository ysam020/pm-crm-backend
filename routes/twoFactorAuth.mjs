import express from "express";
import UserModel from "../model/userModel.mjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/api/2fa/setup", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }

    // Check if the user already has a 2FA secret
    if (user.twoFactorSecret) {
      return res.status(200).json({ message: "2FA already enabled." });
    }

    // Generate a new 2FA secret for the user
    const secret = speakeasy.generateSecret({
      name: `Paymaster CRM (${user.username})`,
    });

    user.twoFactorSecret = secret.base32; // Save the base32 encoded secret in DB

    // Call the method to generate backup codes
    user.generateBackupCodes(); // Call the method defined in the model
    await user.save(); // Save user document to the database

    // Generate a QR code for the user to scan with Google Authenticator
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    // Send the QR code and backup codes to the client for scanning
    return res.status(200).json({
      message: "2FA setup required",
      qrCode: qrCode, // Frontend will display this QR code for scanning
      backupCodes: user.backupCodes, // Optionally return the backup codes
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
