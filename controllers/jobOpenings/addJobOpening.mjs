/**
 * @swagger
 * /api/add-job-opening:
 *   post:
 *     summary: Add a new job opening
 *     description: This route allows an authenticated user to create a new job opening in the system. It checks for an existing job opening with the same title that is still active before creating a new one.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *               jobPostingDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-10"
 *               applicationDeadline:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-01"
 *               jobDescription:
 *                 type: string
 *                 example: "Responsible for building and maintaining web applications using the MERN stack."
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js"]
 *               experience:
 *                 type: string
 *                 example: "3+ years"
 *               employmentType:
 *                 type: string
 *                 example: "Full-time"
 *               budget:
 *                 type: number
 *                 format: float
 *                 example: 60000
 *               hiringManager:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Successfully created the job opening.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job opening created successfully"
 *       400:
 *         description: Bad Request. The request body may have validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating job opening"
 *       409:
 *         description: Conflict. A job with the same title and an active application deadline already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "A job with the same title is active."
 *     tags:
 *       - Recruitment
 */

import JobOpeningModel from "../../model/jobOpeneningModel.mjs";

const addJobOpening = async (req, res, next) => {
  try {
    // Check for an existing job with the same title and an unexpired application deadline
    const existingJob = await JobOpeningModel.findOne({
      jobTitle: req.body.jobTitle,
      applicationDeadline: { $gte: new Date() },
    });

    if (existingJob) {
      return res.status(409).json({
        message: "A job with the same title is active.",
      });
    }

    // Create a new job opening instance
    const newJobOpening = new JobOpeningModel({
      jobTitle: req.body.jobTitle,
      numberOfVacancies: req.body.numberOfVacancies,
      jobPostingDate: req.body.jobPostingDate,
      applicationDeadline: req.body.applicationDeadline,
      jobDescription: req.body.jobDescription,
      requiredSkills: req.body.requiredSkills,
      experience: req.body.experience,
      location: req.body.location,
      budget: req.body.budget,
      hiringManager: req.body.hiringManager,
    });

    // Save the job opening to the database
    await newJobOpening.save();

    // Send a success response
    res.status(201).json({
      message: "Job opening created successfully",
    });
  } catch (error) {
    next(error);
    res.status(400).json({ message: "Error creating job opening:", error });
  }
};

export default addJobOpening;
