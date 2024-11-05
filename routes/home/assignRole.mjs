import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/assign-role", async (req, res) => {
  try {
    const { username, role } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.role = role;
    await user.save(); // Ensure the save operation is awaited

    res.send({ message: "User role assigned" });
  } catch (error) {
    console.error("Error assigning role:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while assigning the role. Please try again later.",
    }); // Send a user-friendly error message
  }
});

export default router;
