import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-user-data/:username", verifySession, async (req, res) => {
  const { username } = req.params;

  try {
    // Exclude the password field
    const user = await UserModel.findOne({ username }).select("-password");

    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
