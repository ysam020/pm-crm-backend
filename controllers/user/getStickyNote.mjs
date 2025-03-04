import UserModel from "../../model/userModel.mjs";

const getStickyNote = async (req, res, next) => {
  try {
    const username = req.user.username;

    const data = await UserModel.findOne({ username });
    res.status(200).send(data.note);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getStickyNote;
