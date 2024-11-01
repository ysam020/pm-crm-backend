import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post(
  "/api/disable-push-notifications",
  verifySession,
  async (req, res) => {
    try {
      const { username } = req.body;
      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(200).send({ message: "User not found" });
      }
      user.fcmTokens = [];
      await user.save();
      res.send({ message: "Push notification disabled" });
    } catch (err) {}
  }
);

export default router;
