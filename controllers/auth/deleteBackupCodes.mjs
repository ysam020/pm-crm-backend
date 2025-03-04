/**
 * @swagger
 * /api/delete-backup-codes:
 *   delete:
 *     summary: Delete backup codes
 *     description: Deletes all backup codes associated with user.
 *     responses:
 *       200:
 *         description: Backup codes deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Backup codes deleted"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting backup codes"
 *     tags:
 *       - Backup Codes
 */

import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const deleteBackupCodes = async (req, res, next) => {
  try {
    const username = req.user.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete backup codes by setting the array to empty
    user.backupCodes = [];

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Backup codes deleted" });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Error deleting backup codes" });
  }
};

export default deleteBackupCodes;
