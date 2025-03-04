/**
 * @swagger
 * /api/disable-push-notifications:
 *   delete:
 *     summary: Disable push notifications for the authenticated user
 *     description: This route disables push notifications for the authenticated user by clearing their Firebase Cloud Messaging (FCM) tokens. The user must be authenticated via a valid session.
 *     responses:
 *       200:
 *         description: Successfully disabled push notifications for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Push notification disabled"
 *       404:
 *         description: User not found. The user with the provided session token doesn't exist in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error. Failed to disable push notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to disable push notifications"
 *     tags:
 *       - Push Notifications
 */

import UserModel from "../../model/userModel.mjs";

const disablePushNotifications = async (req, res, next) => {
  try {
    const username = req.user.username;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    user.fcmTokens = [];
    await user.save();
    res.status(200).send({ message: "Push notification disabled" });
  } catch (err) {
    next(err);
    res.status(500).send({ message: "Failed to disable push notifications" });
  }
};

export default disablePushNotifications;
