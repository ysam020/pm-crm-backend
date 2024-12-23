import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addJobOpening from "../controllers/jobOpenings/addJobOpening.mjs";
import applyForJob from "../controllers/jobOpenings/applyForJob.mjs";
import getJobTitles from "../controllers/jobOpenings/getJobTitles.mjs";
import hireCandidate from "../controllers/jobOpenings/hireCandidate.mjs";
import rejectApplication from "../controllers/jobOpenings/rejectApplication.mjs";
import scheduleInterview from "../controllers/jobOpenings/scheduleInterview.mjs";
import viewApplications from "../controllers/jobOpenings/viewApplications.mjs";
import viewJobOpening from "../controllers/jobOpenings/viewJobOpening.mjs";
import viewJobOpenings from "../controllers/jobOpenings/viewJobOpenings.mjs";

const router = express.Router();

router.post("/api/add-job-opening", verifySession, addJobOpening);
router.post("/api/apply-for-job", applyForJob);
router.get("/api/get-job-titles", getJobTitles);
router.put("/api/hire-candidate", verifySession, hireCandidate);
router.put("/api/reject-application", verifySession, rejectApplication);
router.put("/api/schedule-interview", verifySession, scheduleInterview);
router.get("/api/view-applications/:id", verifySession, viewApplications);
router.get("/api/view-job-opening/:id", verifySession, viewJobOpening);
router.get("/api/view-job-openings", verifySession, viewJobOpenings);

export default router;
