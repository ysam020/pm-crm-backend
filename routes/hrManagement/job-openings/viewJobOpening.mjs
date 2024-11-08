import express from "express";
import JobOpeningsModel from "../../../model/jobOpeneningModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/view-job-opening/:id", verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobOpeningsModel.findById(id);

    if (!job) {
      return res.status(200).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
