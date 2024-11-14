/**
 * @swagger
 * /api/logout:
 *   get:
 *     summary: Log out the user by invalidating the session
 *     description: This endpoint logs out the user by removing the session associated with the provided JWT token. It also clears the authentication cookie.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out the user and invalidated the session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       404:
 *         description: User not registered
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
 *                   example: "Something went wrong"
 *     tags:
 *       - Authentication
 */

import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/api/logout", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user and remove the session
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the session based on the token (you can also store session ID if needed)
    user.sessions = user.sessions.filter(
      (session) => session.sessionID !== token
    );

    // Save the updated user document
    await user.save();

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
