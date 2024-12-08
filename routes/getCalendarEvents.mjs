import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/get-calendar-events", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Fetch the user and filter events
    const user = await UserModel.findOne({ username }).select("events");
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Sort the events by date in ascending order (from earliest to latest)
    user.events.sort((a, b) => {
      return a.date.localeCompare(b.date); // Compare dates in yyyy-mm-dd format
    });

    res.status(200).send(user.events);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
