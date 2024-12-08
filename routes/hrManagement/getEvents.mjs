import express from "express";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-events", verifySession, async (req, res) => {
  try {
    // Get today's date and format as MM-DD
    const today = new Date();
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;

    // Find users with today's birthday or work anniversary
    const users = await UserModel.find({
      $or: [
        { dob: { $regex: `-${todayMonthDay}$` } },
        { joining_date: { $regex: `-${todayMonthDay}$` } },
      ],
    });

    // Initialize arrays to group names for events
    const birthdays = [];
    const workAnniversaries = [];

    // Collect names and group events
    users.forEach((user) => {
      const fullName = [user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(" ");

      if (user.dob?.endsWith(todayMonthDay)) {
        birthdays.push(fullName);
      }

      if (user.joining_date?.endsWith(todayMonthDay)) {
        workAnniversaries.push(fullName);
      }
    });

    // Construct grouped response messages
    const response = [];
    if (birthdays.length > 0) {
      response.push({
        event: "Birthday",
        message: `Happy Birthday, ${birthdays
          .join(", ")
          .replace(/, ([^,]*)$/, " and $1")}!`,
      });
    }

    if (workAnniversaries.length > 0) {
      response.push({
        event: "Work Anniversary",
        message: `Happy Work Anniversary, ${workAnniversaries
          .join(", ")
          .replace(/, ([^,]*)$/, " and $1")}!`,
      });
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
