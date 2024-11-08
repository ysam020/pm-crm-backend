import express from "express";
import JobOpeningsModel from "../../../model/jobOpeneningModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/view-job-openings", verifySession, async (req, res) => {
  try {
    const jobs = await JobOpeningsModel.find({});

    if (!jobs) {
      return res.status(200).json({ message: "No jobs found" });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
