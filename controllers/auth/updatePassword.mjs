/**
 * @swagger
 * /api/update-password:
 *   put:
 *     summary: Reset user password using OTP
 *     description: This route allows a user to reset their password by providing a valid OTP (One-Time Password). The OTP must be the same as the one stored in the user's record and should not be expired. The route hashes the new password, updates the user's password, and clears the OTP and expiration fields. The user's failed login attempts are reset, and the account is unblocked if previously blocked.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user resetting the password.
 *               otp:
 *                 type: string
 *                 description: The OTP provided by the user to validate the password reset.
 *               password:
 *                 type: string
 *                 description: The new password to be set for the user.
 *     responses:
 *       200:
 *         description: Password successfully reset.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to send email"
 *       400:
 *         description: Invalid or expired OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired OTP"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error. Failed to reset the password due to a server issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *     tags:
 *       - Authentication
 */

import User from "../../model/userModel.mjs";

const updatePassword = async (req, res, next) => {
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
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default updatePassword;
