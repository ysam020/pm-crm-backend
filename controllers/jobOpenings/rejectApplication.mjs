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
 *                 example: "000000000000"
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *               reason:
 *                 type: string
 *                 example: "Did not meet requirements"
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
 *       - Recruitment
 */

import JobApplicationModel from "../../model/jobApplicationModel.mjs";

const rejectApplication = async (req, res, next) => {
  try {
    const { aadharNo, reason, _id } = req.body;
    const job = await JobApplicationModel.findOne({
      aadharNo,
      jobTitle: _id,
    });
    if (!job) {
      return res.status(404).json({ message: "Application not found" });
    }
    job.status = "Rejected";
    job.reason = reason;
    await job.save();

    res.status(200).json({ message: "Application rejected" });
  } catch (err) {
    next(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default rejectApplication;
