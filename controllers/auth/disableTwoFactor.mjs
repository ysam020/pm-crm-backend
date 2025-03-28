/**
 * @swagger
 * /api/disable-two-factor:
 *   delete:
 *     summary: Disable two-factor authentication
 *     description: Disables two-factor authentication for the user. It also removes the associated twoFactorSecret and QR code.
 *     responses:
 *       200:
 *         description: Successfully disabled two-factor authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Two factor authentication disabled"
 *       404:
 *         description: User not found - if the user doesn't exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - error disabling two-factor authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to disable two-factor authentication"
 *     tags:
 *       - Two Factor Authentication
 */

import UserModel from "../../model/userModel.mjs";

const disableTwoFactor = async (req, res, next) => {
  try {
    const username = req.user.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Disable two-factor authentication
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.qrCodeImage = null;

    await user.save();
    res.send({ message: "Two factor authentication disabled" });
  } catch (error) {
    next(error);
    res
      .status(500)
      .send({ message: "Failed to disable two-factor authentication" }); // 500 for server error
  }
};

export default disableTwoFactor;
