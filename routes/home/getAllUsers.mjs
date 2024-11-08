import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.get("/api/get-all-users", async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while fetching users. Please try again later.",
    }); // Send a user-friendly error message
  }
});

export default router;
