import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import addTraining from "../controllers/training/addTraining.mjs";
import viewTrainings from "../controllers/training/viewTrainings.mjs";

const router = express.Router();

router.post(
  "/api/add-training",
  isAuthenticated,
  hasAccess("Training And Development"),
  addTraining
);
router.get(
  "/api/view-trainings/:username",
  isAuthenticated,
  hasAccess("Training And Development"),
  viewTrainings
);

export default router;
