import express from "express";
import UserModel from "../../../model/userModel.mjs";

const router = express.Router();

router.post("/api/add-training", async (req, res) => {
  try {
    const {
      username,
      trainingProgram,
      trainingDate,
      duration,
      trainingProvider,
      feedback,
    } = req.body;

    // Validation: Ensure required fields are provided
    if (!username) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Define the training object
    const newTraining = {
      trainingProgram,
      trainingDate,
      duration,
      trainingProvider,
      feedback,
    };

    // Use findOneAndUpdate to add or update the document
    const updatedUser = await UserModel.findOneAndUpdate(
      { username }, // Filter to find user by username
      {
        $setOnInsert: { username }, // If user does not exist, set username
        $push: { trainings: newTraining }, // Push the new training into the trainings array
      },
      {
        new: true, // Return the modified document
        upsert: true, // Create a new document if no match is found
      }
    );

    res.status(201).send({
      message: "Training added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error adding training:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
