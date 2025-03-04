import UserModel from "../../model/userModel.mjs";

const deleteCalendarEvent = async (req, res, next) => {
  try {
    const username = req.user.username;

    const { _id } = req.params;

    const user = await UserModel.findOneAndUpdate(
      { username },
      { $pull: { events: { _id } } }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "Event deleted" });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default deleteCalendarEvent;
