import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
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

router.post("/api/add-job-opening", isAuthenticated, addJobOpening);
router.post("/api/apply-for-job", applyForJob);
router.get("/api/get-job-titles", getJobTitles);
router.put("/api/hire-candidate", isAuthenticated, hireCandidate);
router.put("/api/reject-application", isAuthenticated, rejectApplication);
router.put("/api/schedule-interview", isAuthenticated, scheduleInterview);
router.get("/api/view-applications/:id", isAuthenticated, viewApplications);
router.get("/api/view-job-opening/:id", isAuthenticated, viewJobOpening);
router.get("/api/view-job-openings", isAuthenticated, viewJobOpenings);

export default router;
