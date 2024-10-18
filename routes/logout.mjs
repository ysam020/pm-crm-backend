import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs"; // Import your user model
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/api/logout", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user and remove the session
    const user = await UserModel.findById(userId);
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
      secure: false, // Set to true in production if using HTTPS
      sameSite: "Lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
