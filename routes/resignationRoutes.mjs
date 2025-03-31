import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import addResignation from "../controllers/resignation/addResignation.mjs";
import viewResignations from "../controllers/resignation/viewResignations.mjs";
import addExitFeedback from "../controllers/resignation/addExitFeedback.mjs";

const router = express.Router();

router.post(
  "/api/add-resignation",
  isAuthenticated,
  hasAccess("Resignation Process"),
  addResignation
);
router.get(
  "/api/view-resignations",
  isAuthenticated,
  hasAccess("Resignation Process"),
  viewResignations
);
router.post(
  "/api/add-exit-feedback",
  isAuthenticated,
  hasAccess("Resignation Process"),
  addExitFeedback
);

export default router;
