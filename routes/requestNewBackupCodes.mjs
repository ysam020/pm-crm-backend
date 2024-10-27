import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs"; // Adjust based on your actual path
import dotenv from "dotenv";
import verifySession from "../middlewares/verifySession.mjs";

dotenv.config();
const router = express.Router();

// Route to renew backup codes
router.get("/api/request-new-backup-codes", verifySession, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user by username extracted from the token
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new backup codes using the schema method
    const newBackupCodes = user.generateBackupCodes();

    // Save the updated user with the new backup codes
    await user.save();

    res.status(200).json({
      message: "New backup codes generated",
      backupCodes: newBackupCodes, // Send the new codes to the frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating new backup codes" });
  }
});

export default router;
