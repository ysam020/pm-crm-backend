import express from "express";
import UserModel from "../../../model/userModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/add-appraisal", verifySession, async (req, res) => {
  try {
    const {
      username,
      appraisalDate,
      performanceScore,
      strengths,
      areasOfImprovement,
      feedback,
    } = req.body;

    // Validation: Ensure required fields are provided
    if (!username || !appraisalDate || performanceScore === undefined) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Define the appraisal object
    const newAppraisal = {
      appraisalDate,
      performanceScore,
      strengths,
      areasOfImprovement,
      feedback,
    };

    // Use findOneAndUpdate to add or update the document
    const updatedUser = await UserModel.findOneAndUpdate(
      { username }, // Filter to find user by username
      {
        $setOnInsert: { username }, // If user does not exist, set username
        $push: { appraisals: newAppraisal }, // Push the new appraisal into the appraisals array
      },
      {
        new: true, // Return the modified document
        upsert: true, // Create a new document if no match is found
      }
    );

    res.status(201).send({
      message: "Appraisal added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error adding appraisal:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
