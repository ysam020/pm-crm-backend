import UserModel from "../../model/userModel.mjs";

const addEvent = async (req, res, next) => {
  try {
    const username = req.user.username;

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
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addEvent;
