/**
 * @swagger
 * /api/add-appraisal:
 *   post:
 *     summary: Add an appraisal for a user
 *     description: This route allows adding an appraisal for a specific user. It requires a valid session token and mandatory appraisal fields. The appraisal details will be added to the user's record and cached for optimization.
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
 *                 description: The username of the employee being appraised.
 *                 example: "john_doe"
 *               appraisalDate:
 *                 type: string
 *                 description: The date of the appraisal.
 *                 example: "2023-12-31"
 *               performanceScore:
 *                 type: number
 *                 description: The performance score for the employee.
 *                 example: 4.5
 *               strengths:
 *                 type: string
 *                 description: Strengths identified during the appraisal.
 *                 example: "Strong problem-solving abilities."
 *               areasOfImprovement:
 *                 type: string
 *                 description: Areas where the employee needs improvement.
 *                 example: "Needs to work on time management."
 *               feedback:
 *                 type: string
 *                 description: General feedback from the appraiser.
 *                 example: "Excellent performance in the last quarter!"
 *     responses:
 *       201:
 *         description: Successfully added the appraisal for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appraisal added successfully"
 *       400:
 *         description: Bad Request - Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *       404:
 *         description: User not found (if user is not registered).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized access due to invalid or missing session token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No token provided"
 *       500:
 *         description: Internal server error in case of unexpected issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Appraisal
 */

import UserModel from "../../model/userModel.mjs";
import { cacheResponse } from "../../utils/cacheResponse.mjs";

const addAppraisal = async (req, res, next) => {
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

    const cacheKey = `appraisals:${username}`;
    await cacheResponse(cacheKey, updatedUser.appraisals);

    res.status(201).send({
      message: "Appraisal added successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addAppraisal;
