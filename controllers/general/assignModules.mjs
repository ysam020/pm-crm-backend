/**
 * @swagger
 * /api/assign-modules:
 *   put:
 *     summary: Assign modules to a user and send notifications
 *     description: This route assigns one or more modules to a user, stores the modules in Firestore (for real-time updates), and sends a notification to the user's devices via Firebase Cloud Messaging (FCM).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user_name"
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Module1", "Module2"]
 *     responses:
 *       200:
 *         description: Modules assigned successfully and notification sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification sent successfully"
 *       400:
 *         description: User has no FCM tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User has no FCM tokens"
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
 *         description: Internal server error when assigning modules or sending notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *     tags:
 *       - Admin
 */

import UserModel from "../../model/userModel.mjs";
import sendPushNotifications from "../../utils/sendPushNotifications.mjs";

const assignModules = async (req, res, next) => {
  try {
    const assignee = req.user.username;
    const { modules, username } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user modules with unique values
    user.modules = [...new Set([...user.modules, ...modules])];

    await user.save();

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const socketId = userSockets.get(username);

    if (socketId) {
      // Emit the event to the specific user's socket
      io.to(socketId).emit("modulesAssigned", {
        modules: user.modules,
      });
    } else {
      console.warn(`No active socket for user: ${username}`);
    }

    // Ensure the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(200).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Notification from ${assignee}`,
        body: `Module assigned: ${modules.join(", ")}`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendPushNotifications(user, payload);

    res.status(200).send({ message: "Notification sent successfully" });
  } catch (error) {
    next(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default assignModules;
