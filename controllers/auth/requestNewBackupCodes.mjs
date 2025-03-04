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

import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";
import protobuf from "protobufjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const requestNewBackupCodes = async (req, res, next) => {
  try {
    // Load the proto file
    const root = await protobuf.load(
      path.join(__dirname, "../../proto/user.proto")
    );

    // Get message types
    const BackupCodesResponse = root.lookupType(
      "userpackage.BackupCodesResponse"
    );

    const username = req.user.username;

    // Find the user by username extracted from the token
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new backup codes using the schema method
    const newBackupCodes = user.generateBackupCodes();

    // Save the updated user with the new backup codes
    await user.save();

    // Create the protobuf message
    const message = BackupCodesResponse.create({
      backupCodes: newBackupCodes,
    });

    // Verify the message
    const error = BackupCodesResponse.verify(message);
    if (error) {
      throw Error(error);
    }

    // Encode the message
    const buffer = BackupCodesResponse.encode(message).finish();

    // Set response headers and send
    res.set("Content-Type", "application/x-protobuf");
    res.send(buffer);
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Error generating new backup codes" });
  }
};

export default requestNewBackupCodes;
