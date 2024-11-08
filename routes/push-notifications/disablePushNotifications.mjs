import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get(
  "/api/disable-push-notifications",
  verifySession,
  async (req, res) => {
    try {
      const token = res.locals.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const username = decoded.username;
      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(200).send({ message: "User not found" });
      }
      user.fcmTokens = [];
      await user.save();
      res.send({ message: "Push notification disabled" });
    } catch (err) {
      console.log(err);
    }
  }
);

export default router;
