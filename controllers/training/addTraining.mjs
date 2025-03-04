/**
 * @swagger
 * /api/add-training:
 *   post:
 *     summary: Add a training to the user's profile
 *     description: This route allows adding a training to a user's profile. The training details such as program, date, duration, provider, and feedback must be provided. A valid session token must be included in the request for authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               trainingProgram:
 *                 type: string
 *                 example: "Leadership Training"
 *               trainingDate:
 *                 type: string
 *                 example: "2023-08-20"
 *               duration:
 *                 type: string
 *                 example: "4 hours"
 *               trainingProvider:
 *                 type: string
 *                 example: "XYZ Corporation"
 *               feedback:
 *                 type: string
 *                 example: "The training was highly informative and beneficial."
 *     responses:
 *       201:
 *         description: Training added successfully to the user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Training added successfully"
 *       400:
 *         description: Missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       401:
 *         description: Unauthorized, No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal server error if something goes wrong.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Training
 */

import UserModel from "../../model/userModel.mjs";
import { cacheResponse } from "../../utils/cacheResponse.mjs";

const addTraining = async (req, res, next) => {
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

    // Fetch the updated trainings for the user
    const updatedTrainings = updatedUser.trainings;

    // Update the cache for the user's trainings
    const cacheKey = `trainings:${username}`;
    await cacheResponse(cacheKey, updatedTrainings);

    res.status(201).send({
      message: "Training added successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addTraining;
