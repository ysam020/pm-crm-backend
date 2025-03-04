import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import completeKyc from "../controllers/employeeKyc/completeKyc.mjs";
import kycApproval from "../controllers/employeeKyc/kycApproval.mjs";
import viewAllKycs from "../controllers/employeeKyc/viewAllKycs.mjs";

const router = express.Router();

router.post("/api/complete-kyc", isAuthenticated, completeKyc);
router.post("/api/kyc-approval", isAuthenticated, kycApproval);
router.get("/api/view-all-kycs", isAuthenticated, viewAllKycs);

export default router;
