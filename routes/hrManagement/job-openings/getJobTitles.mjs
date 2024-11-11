/**
 * @swagger
 * /api/get-job-titles:
 *   get:
 *     summary: Get unique job titles from active job openings
 *     description: This route fetches all unique job titles from job openings that have a future application deadline. It ensures that only active jobs are considered.
 *     responses:
 *       200:
 *         description: Successfully fetched unique job titles from active job openings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "Software Engineer"
 *       500:
 *         description: Internal Server Error. An error occurred while fetching job titles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while fetching job titles. Please try again later."
 *     tags:
 *       - Job Applications
 */

import express from "express";
import JobOpeningModel from "../../../model/jobOpeneningModel.mjs";

const router = express.Router();

router.get("/api/get-job-titles", async (req, res) => {
  try {
    // Get the current date and time
    const currentDate = new Date();

    // Find all documents where applicationDeadline is in the future
    const jobApplications = await JobOpeningModel.find({
      applicationDeadline: { $gt: currentDate },
    });

    // Extract unique job titles using a Set
    const uniqueJobTitles = [
      ...new Set(jobApplications.map((job) => job.jobTitle)),
    ];

    res.status(200).json(uniqueJobTitles);
  } catch (error) {
    console.error("Error fetching job titles:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching job titles. Please try again later.",
    });
  }
});

export default router;
