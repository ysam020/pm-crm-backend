import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import addStickyNote from "../controllers/user/addStickyNote.mjs";
import getStickyNote from "../controllers/user/getStickyNote.mjs";
import addEvent from "../controllers/user/addEvent.mjs";
import getCalendarEvents from "../controllers/user/getCalendarEvents.mjs";
import deleteCalendarEvent from "../controllers/user/deleteCalendarEvent.mjs";
import getUserData from "../controllers/user/getUserData.mjs";

const router = express.Router();

router.post("/api/add-sticky-note", verifySession, addStickyNote);
router.get("/api/get-sticky-note", verifySession, getStickyNote);
router.post("/api/add-event", verifySession, addEvent);
router.get("/api/get-calendar-events", verifySession, getCalendarEvents);
router.delete(
  "/api/delete-calendar-event/:_id",
  verifySession,
  deleteCalendarEvent
);
router.get("/api/get-user-data/:username", verifySession, getUserData);

export default router;
