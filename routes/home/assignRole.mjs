/**
 * @swagger
 * /api/assign-role:
 *   put:
 *     summary: Assign a role to a user
 *     description: This route assigns a specific role to a specified user. It updates the user's role in the database.
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
 *               role:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Role successfully assigned to the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role assigned"
 *       404:
 *         description: User not found with the provided username.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error when assigning the role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while assigning the role. Please try again later."
 *     tags:
 *       - Admin
 */

import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.put("/api/assign-role", async (req, res) => {
  try {
    const { username, role } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.role = role;
    await user.save(); // Ensure the save operation is awaited

    res.status(200).send({ message: "User role assigned" });
  } catch (error) {
    console.error("Error assigning role:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while assigning the role. Please try again later.",
    });
  }
});

export default router;
