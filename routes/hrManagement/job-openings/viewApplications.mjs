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
