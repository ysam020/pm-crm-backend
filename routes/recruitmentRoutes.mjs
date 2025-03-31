import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
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

router.post(
  "/api/add-job-opening",
  isAuthenticated,
  hasAccess("Job Openings"),
  addJobOpening
);
router.post("/api/apply-for-job", applyForJob);
router.get("/api/get-job-titles", getJobTitles);
router.put(
  "/api/hire-candidate",
  isAuthenticated,
  hasAccess("Job Openings"),
  hireCandidate
);
router.put(
  "/api/reject-application",
  isAuthenticated,
  hasAccess("Job Openings"),
  rejectApplication
);
router.put(
  "/api/schedule-interview",
  isAuthenticated,
  hasAccess("Job Openings"),
  scheduleInterview
);
router.get(
  "/api/view-applications/:id",
  isAuthenticated,
  hasAccess("Job Openings"),
  viewApplications
);
router.get(
  "/api/view-job-opening/:id",
  isAuthenticated,
  hasAccess("Job Openings"),
  viewJobOpening
);
router.get(
  "/api/view-job-openings",
  isAuthenticated,
  hasAccess("Job Openings"),
  viewJobOpenings
);

export default router;
