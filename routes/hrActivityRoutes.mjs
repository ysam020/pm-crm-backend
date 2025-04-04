import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import addHrActivity from "../controllers/hrActivities/addHrActivity.mjs";
import getHrActivities from "../controllers/hrActivities/getHrActivities.mjs";

const router = express.Router();

router.post(
  "/api/add-hr-activity",
  isAuthenticated,
  hasAccess("HR Activities"),
  addHrActivity
);
router.get("/api/get-hr-activities", isAuthenticated, getHrActivities);

export default router;
