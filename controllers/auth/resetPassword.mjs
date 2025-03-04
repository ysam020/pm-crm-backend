/**
 * @swagger
 * /api/reset-password:
 *   put:
 *     summary: Reset user password
 *     description: This route allows the user to reset their password. The user must provide their current password and the new password they wish to set. A valid session token must be included in the request for authentication.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: The current password and the new password to set.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               example: "currentPassword123"
 *               description: The user's current password.
 *             new_password:
 *               type: string
 *               example: "newPassword123"
 *               description: The new password to set for the user.
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       404:
 *         description: User not registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       409:
 *         description: Incorrect password provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect password"
 *       500:
 *         description: Server error. Something went wrong while processing the request.
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

import UserModel from "../../model/userModel.mjs";

const resetPassword = async (req, res, next) => {
  try {
    const { password, new_password } = req.body;

    const username = req.user.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(409).json({ message: "Incorrect password" });
    }

    // Update the user's password in the database
    user.password = new_password;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default resetPassword;
