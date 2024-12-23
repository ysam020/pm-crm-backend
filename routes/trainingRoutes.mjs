import express from "express";
import addTraining from "../controllers/training/addTraining.mjs";
import viewTrainings from "../controllers/training/viewTrainings.mjs";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/add-training", verifySession, addTraining);
router.get("/api/view-trainings/:username", verifySession, viewTrainings);

export default router;
