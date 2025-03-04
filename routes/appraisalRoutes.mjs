import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import addAppraisal from "../controllers/appraisals/addAppraisal.mjs";
import viewAppraisals from "../controllers/appraisals/viewAppraisals.mjs";

const router = express.Router();

router.post("/api/add-appraisal", isAuthenticated, addAppraisal);
router.get("/api/view-appraisals/:username", isAuthenticated, viewAppraisals);

export default router;
