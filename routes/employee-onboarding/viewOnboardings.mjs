import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/view-onboardings", verifySession, async (req, res) => {
  try {
    const users = await UserModel.find(
      {},
      "username first_name middle_name last_name email skill employee_photo resume address_proof"
    );
    res.send(users.reverse()); // Reverse the array to have the last item at the top
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred while fetching users." });
  }
});

export default router;
