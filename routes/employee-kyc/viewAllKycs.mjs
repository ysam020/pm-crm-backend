import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/view-all-kycs", verifySession, async (req, res) => {
  const users = await UserModel.find(
    {},
    "first_name middle_name last_name username email company kyc_approval"
  );
  res.send(users.reverse());
});

export default router;
