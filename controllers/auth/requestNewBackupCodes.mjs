/**
 * @swagger
 * /api/request-new-backup-codes:
 *   get:
 *     summary: Generate new backup codes for the user
 *     description: This endpoint allows a user to request new backup codes. The user's backup codes are regenerated and saved in database after encryption, and the new set of decrypted backup codes is sent back in the response.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated new backup codes for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "New backup codes generated"
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "AA00AA00"
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
 *         description: Internal server error if something goes wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error generating new backup codes"
 *     tags:
 *       - Backup Codes
 */

import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const requestNewBackupCodes = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user by username extracted from the token
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new backup codes using the schema method
    const newBackupCodes = user.generateBackupCodes();

    // Save the updated user with the new backup codes
    await user.save();

    res.status(200).json({
      message: "New backup codes generated",
      backupCodes: newBackupCodes, // Send the new codes to the frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating new backup codes" });
  }
};

export default requestNewBackupCodes;
