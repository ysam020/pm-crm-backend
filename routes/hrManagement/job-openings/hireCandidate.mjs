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
import UserModel from "../../../model/userModel.mjs";
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

    // Add new user to the UserModel
    const nameParts = job.name.split(" ");
    let first_name,
      middle_name = null,
      last_name = null;

    if (nameParts.length === 1) {
      // Single character name
      first_name = nameParts[0];
      last_name = "";
    } else if (nameParts.length === 2) {
      // Two-part name
      [first_name, last_name] = nameParts;
    } else if (nameParts.length > 2) {
      // More than two parts
      first_name = nameParts[0];
      last_name = nameParts[nameParts.length - 1];
      middle_name = nameParts.slice(1, -1).join(" ");
    } else {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid name format" });
    }

    const username = last_name ? `${first_name}_${last_name}` : first_name;

    const password = process.env.DEFAULT_PASSWORD;

    const rankMapping = {
      MD: 1,
      PROPRIETOR: 1,
      "CENTER HEAD": 1,
      HOD: 1,
      "BACK OFFICE MANAGER": 2,
      "OPERATION MANAGER": 2,
      MANAGER: 2,
      AM: 2,
      "HR MANAGER": 2,
      "HR ADMIN": 2,
      "HR-BACK OFFICE EXECUTIVE": 3,
      "BACK OFFICE EXECUTIVE": 3,
      "HR EXECUTIVE": 3,
      "HR & BACKEND": 3,
      "FIELD EXECUTIVE": 3,
      "TEAM LEADER": 3,
      ATL: 3,
      "MIS EXECUTIVE": 3,
      "Q.A.": 3,
      TRAINER: 3,
      TELECALLER: 4,
      "HOUSE KEEPING": 4,
      GUARD: 4,
    };

    const rank = rankMapping[jobTitle.toUpperCase()] || 5;

    const newUser = new UserModel({
      first_name: first_name,
      middle_name: middle_name ? middle_name : "",
      last_name: last_name ? last_name : "",
      designation: jobTitle,
      username,
      password,
      rank,
    });

    await newUser.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({ message: "Hired successfully and user created" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    res.status(500).json({ message: "Something went wrong" });
  } finally {
    session.endSession();
  }
});

export default router;
