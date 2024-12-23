import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const deleteCalendarEvent = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

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
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default deleteCalendarEvent;
