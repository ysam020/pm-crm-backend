import express from "express";
import addTraining from "../controllers/training/addTraining.mjs";
import viewTrainings from "../controllers/training/viewTrainings.mjs";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";

const router = express.Router();

router.post("/api/add-training", isAuthenticated, addTraining);
router.get("/api/view-trainings/:username", isAuthenticated, viewTrainings);

export default router;
