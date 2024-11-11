/**
 * @swagger
 * /api/get-user-modules/{username}:
 *   get:
 *     summary: Retrieve a user's assigned modules
 *     description: This route retrieves the modules assigned to a specific user.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose modules are being retrieved.
 *         schema:
 *           type: string
 *           example: "user_name"
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "user_name"
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Module 1", "Module 2"]
 *       500:
 *         description: Internal server error when retrieving user modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
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
 *     tags:
 *       - Admin
 */

import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.get(
  "/api/get-user-modules/:username",
  verifySession,
  async (req, res) => {
    try {
      const { username } = req.params;
      const user = await UserModel.findOne({ username }).select(
        "username modules"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
