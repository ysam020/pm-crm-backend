import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/disable-two-factor", verifySession, async (req, res) => {
  const { username } = req.body;

  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(200).send({ message: "User not found" });
  }
  user.isTwoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.qrCodeImage = null;
  await user.save();
  res.send({ message: "Two factor authentication disabled" });
});

export default router;