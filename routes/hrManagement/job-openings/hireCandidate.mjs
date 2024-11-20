/**
 * @swagger
 * /api/hire-candidate:
 *   put:
 *     summary: Hire a candidate
 *     description: This route allows an authorized user to hire a candidate by specifying the applicant's Aadhaar number and the job title.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aadharNo:
 *                 type: string
 *                 example: "1234-5678-9101"
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *     responses:
 *       200:
 *         description: Application successfully rejected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application rejected"
 *       404:
 *         description: Application not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application not found"
 *       500:
 *         description: Internal server error.
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
import mongoose from "mongoose";
import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
import JobOpeningModel from "../../../model/jobOpeneningModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.put("/api/hire-candidate", verifySession, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { aadharNo, jobTitle } = req.body;

    // Find the job application
    const job = await JobApplicationModel.findOne({
      aadharNo,
      jobTitle,
    }).session(session);
    if (!job) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Application not found" });
    }

    if (job.status === "Hired") {
      await session.abortTransaction();
      return res.status(409).json({ message: "Candidate already hired" });
    }

    // Update the job application status
    job.status = "Hired";
    await job.save({ session });

    // Update the job opening with the incremented hired count
    const existingJob = await JobOpeningModel.findOne({
      jobTitle: jobTitle,
      applicationDeadline: { $gte: new Date() },
    }).session(session);

    if (!existingJob) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Job opening not found" });
    }

    if (existingJob.candidatesHired >= existingJob.numberOfVacancies) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "All vacancies have been filled for this job",
      });
    }

    existingJob.candidatesHired += 1;
    await existingJob.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({ message: "Hired successfully" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ message: "Something went wrong" });
  } finally {
    session.endSession();
  }
});

export default router;
