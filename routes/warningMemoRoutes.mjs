import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addWarningMemo from "../controllers/warningMemo/addWarningMemo.mjs";
import viewWarningMemos from "../controllers/warningMemo/viewWarningMemos.mjs";

const router = express.Router();

router.post("/api/add-warning-memo", verifySession, addWarningMemo);
router.get(
  "/api/view-warning-memos/:username",
  verifySession,
  viewWarningMemos
);

export default router;
