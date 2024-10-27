import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/get-user-profile", verifySession, async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const username = decoded.username;
  try {
    // Find the user by their username and select necessary fields
    const user = await UserModel.findOne({ username }).select(
      "username modules employee_photo"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
