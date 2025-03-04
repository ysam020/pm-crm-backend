import UserModel from "../../model/userModel.mjs";

const getCalendarEvents = async (req, res, next) => {
  try {
    const username = req.user.username;

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
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getCalendarEvents;
