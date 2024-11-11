/**
 * @swagger
 * /api/view-applications/{id}:
 *   get:
 *     summary: View applications for a specific job opening
 *     description: This route allows HR or admin to view all job applications for a specific job opening, excluding rejected applications.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the job opening.
 *         schema:
 *           type: string
 *           example: "64f1a4dff1b2a1c9b4e357d6"
 *     responses:
 *       200:
 *         description: Successfully fetched job applications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   mobile:
 *                     type: string
 *                     example: "+91 9876543210"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   aadharNo:
 *                     type: string
 *                     example: "1234 5678 9101"
 *                   jobTitle:
 *                     type: string
 *                     example: "Software Engineer"
 *                   interviewDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-15T10:00:00Z"
 *       500:
 *         description: Internal server error when fetching applications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Job Applications
 */

import express from "express";
import JobOpeningsModel from "../../../model/jobOpeneningModel.mjs";
import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/view-applications/:id", verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobOpeningsModel.findById(id);
    const jobTitle = job.jobTitle;

    const applications = await JobApplicationModel.find({
      jobTitle,
      status: { $ne: "Rejected" },
    });
    const jobApplications = applications.map((application) => {
      return {
        name: application.name,
        mobile: application.mobile,
        email: application.email,
        aadharNo: application.aadharNo,
        jobTitle: application.jobTitle,
        interviewDate: application.interviewDate,
      };
    });

    res.status(200).json(jobApplications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
