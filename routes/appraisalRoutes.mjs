import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import addAppraisal from "../controllers/appraisals/addAppraisal.mjs";
import viewAppraisals from "../controllers/appraisals/viewAppraisals.mjs";

const router = express.Router();

router.post(
  "/api/add-appraisal",
  isAuthenticated,
  hasAccess("Performance Appraisal"),
  addAppraisal
);
router.get(
  "/api/view-appraisals/:username",
  isAuthenticated,
  hasAccess("Performance Appraisal"),
  viewAppraisals
);

export default router;
