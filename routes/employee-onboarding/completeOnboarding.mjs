import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/complete-onboarding", verifySession, async (req, res) => {
  try {
    const {
      username,
      skill,
      company_policy_visited,
      employee_photo,
      resume,
      address_proof,
    } = req.body;

    // Build the update object dynamically
    const updateFields = {};
    if (skill) updateFields.skill = skill;
    if (company_policy_visited)
      updateFields.company_policy_visited = company_policy_visited;
    if (employee_photo) updateFields.employee_photo = employee_photo;
    if (resume) updateFields.resume = resume;
    if (address_proof) updateFields.address_proof = address_proof;

    // Find the user by username and update the specified fields
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      { $set: updateFields },
      { new: true } // This option ensures the method returns the updated document
    );

    // If user is not found, send an error response
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    // Send a success response
    res.send({ message: "Successfully completed onboarding" });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
