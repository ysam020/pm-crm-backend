import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.mjs";
import hasAccess from "../middlewares/hasAccess.mjs";
import addWarningMemo from "../controllers/warningMemo/addWarningMemo.mjs";
import viewWarningMemos from "../controllers/warningMemo/viewWarningMemos.mjs";

const router = express.Router();

router.post(
  "/api/add-warning-memo",
  isAuthenticated,
  hasAccess("Warning Memo"),
  addWarningMemo
);
router.get(
  "/api/view-warning-memos/:username",
  isAuthenticated,
  hasAccess("Warning Memo"),
  viewWarningMemos
);

export default router;
