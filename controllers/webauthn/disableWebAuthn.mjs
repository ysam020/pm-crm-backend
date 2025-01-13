/**
 * @swagger
 * /api/disable-webauthn:
 *   get:
 *     summary: Disable WebAuthn for the current user
 *     description: This route allows the user to disable WebAuthn by clearing their WebAuthn credentials from the database. The user must be authenticated using a valid session token.
 *     responses:
 *       200:
 *         description: Successfully disabled WebAuthn for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WebAuthn disabled"
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
 *         description: Internal server error. Failed to disable WebAuthn credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to disable WebAuthn"
 *     tags:
 *       - WebAuthn
 */

import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const disableWebAuthn = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.webAuthnCredentials = [];
    await user.save();
    res.status(200).json({ message: "WebAuthn disabled" });
  } catch (error) {
    console.error("Error disabling WebAuthn:", error);
    res.status(500).json({ message: "Failed to disable WebAuthn" });
  }
};

export default disableWebAuthn;
