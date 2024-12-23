import User from "../../model/userModel.mjs";

const updatePassword = async (req, res) => {
  try {
    const { username, otp, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP is valid and not expired
    if (
      user.decryptField("resetPasswordOTP", user.resetPasswordOTP) !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update the user's password and clear the OTP fields
    user.password = password; // Update the password
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
    res.status(500).json({ message: "Internal server error" });
  }
};

export default updatePassword;
