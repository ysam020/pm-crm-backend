import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import completeKyc from "../controllers/employeeKyc/completeKyc.mjs";
import kycApproval from "../controllers/employeeKyc/kycApproval.mjs";
import viewAllKycs from "../controllers/employeeKyc/viewAllKycs.mjs";
const router = express.Router();

router.post(
  "/api/complete-kyc",
  isAuthenticated,
  hasAccess("Basic KYC Details"),
  completeKyc
);
router.post(
  "/api/kyc-approval",
  isAuthenticated,
  hasAccess("Basic KYC Details"),
  kycApproval
);
router.get(
  "/api/view-all-kycs",
  isAuthenticated,
  hasAccess("Basic KYC Details"),
  viewAllKycs
);

export default router;
