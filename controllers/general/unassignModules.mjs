/**
 * @swagger
 * /api/unassign-modules:
 *   put:
 *     summary: Unassign modules from a user
 *     description: This route removes specified modules from a user's list of assigned modules both in MongoDB and Firestore.
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
 *                 example: ["Module 1", "Module 2"]
 *     responses:
 *       200:
 *         description: Successfully unassigned the modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Modules unassigned successfully."
 *       400:
 *         description: Invalid request due to missing or invalid username or modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request: Username and modules are required."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Internal server error while unassigning modules.
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

const unassignModules = async (req, res, next) => {
  try {
    const { modules, username } = req.body;
    // Verify that username and modules are provided
    if (!username || !Array.isArray(modules) || modules.length === 0) {
      return res.status(400).send({
        message: "Invalid request: Username and modules are required.",
      });
    }

    // Find the user in MongoDB
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Remove the modules from the user's list
    user.modules = user.modules.filter((module) => !modules.includes(module));
    await user.save();

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const socketId = userSockets.get(username);

    if (socketId) {
      // Emit the event to the specific user's socket
      io.to(socketId).emit("modulesUnassigned", {
        modules: user.modules,
      });
    } else {
      console.warn(`No active socket for user: ${username}`);
    }

    res.status(200).send({ message: "Modules unassigned successfully." });
  } catch (error) {
    next(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default unassignModules;
