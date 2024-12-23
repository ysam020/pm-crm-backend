import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const addEvent = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const event = req.body;

    // Find the user and add the event
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.events.push(event); // Add the event to the user's events array
    await user.save(); // Save the user with the new event
    res.status(201).send({ message: "Event added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addEvent;
