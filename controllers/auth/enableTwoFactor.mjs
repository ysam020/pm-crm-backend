import speakeasy from "speakeasy";
import QRCode from "qrcode";
import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const enableTwoFactor = async (req, res) => {
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
      backupCodes: decryptedBackupCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while enabling 2FA" });
  }
};

export default enableTwoFactor;
