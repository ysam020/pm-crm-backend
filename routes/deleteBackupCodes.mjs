import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs";
import dotenv from "dotenv";
import verifySession from "../middlewares/verifySession.mjs";

dotenv.config();
const router = express.Router();

// Route to delete backup codes
router.delete("/api/delete-backup-codes", verifySession, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete backup codes by setting the array to empty
    user.backupCodes = [];

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Backup codes deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting backup codes" });
  }
});

export default router;
