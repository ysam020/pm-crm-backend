/**
 * @swagger
 * /api/reject-application:
 *   put:
 *     summary: Reject a job application
 *     description: This route allows an authorized user to reject a job application by specifying the applicant's Aadhaar number and the job title.
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
import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.put("/api/reject-application", verifySession, async (req, res) => {
  try {
    const { aadharNo, jobTitle } = req.body;
    const job = await JobApplicationModel.findOne({
      aadharNo,
      jobTitle,
    });
    if (!job) {
      return res.status(404).json({ message: "Application not found" });
    }
    job.status = "Rejected";
    await job.save();

    res.status(200).json({ message: "Application rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
