import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.get(
  "/api/get-user-profile/:username",
  verifySession,
  async (req, res) => {
    const { username } = req.params;

    try {
      // Find the user and include the sessions in the selection
      const user = await UserModel.findOne({ username }).select(
        "username email role modules first_name middle_name last_name employee_photo sessions"
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" }); // Return 404 if user is not found
      }

      // Prepare the response data
      const responseData = {
        username: user.username,
        email: user.email,
        role: user.role,
        modules: user.modules,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        employee_photo: user.employee_photo,
      };

      res.status(200).json(responseData);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
