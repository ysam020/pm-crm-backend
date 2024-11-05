import express from "express";
import bcrypt from "bcrypt";
import User from "../model/userModel.mjs";

const router = express.Router();

router.post("/api/update-password", async (req, res) => {
  try {
    const { username, otp, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP is valid and not expired
    if (
      user.resetPasswordOTP !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the OTP fields
    user.password = hashedPassword; // Update the password
    user.resetPasswordOTP = undefined; // Clear the OTP
    user.resetPasswordExpires = undefined; // Clear the expiration

    // Reset failed login attempts and blocking status
    user.failedLoginAttempts = 0; // Reset attempts
    user.isBlocked = false; // Unblock the account
    user.blockedUntil = null; // Clear blockedUntil field

    await user.save();

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Error in update-password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
