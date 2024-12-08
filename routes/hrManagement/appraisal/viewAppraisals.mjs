import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get(
  "/api/view-appraisals/:username",
  verifySession,
  async (req, res) => {
    try {
      const { username } = req.params;
      const user = await UserModel.findOne({ username });

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.status(200).send(user.appraisals);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
