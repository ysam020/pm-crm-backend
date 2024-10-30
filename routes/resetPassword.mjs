import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../model/userModel.mjs";
import jwt from "jsonwebtoken";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/reset-password", verifySession, async (req, res) => {
  const { password, new_password } = req.body;
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ message: "Unauthorized: No token provided" });
  }

  const username = jwt.verify(token, process.env.JWT_SECRET).username;

  try {
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ message: "Incorrect password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
