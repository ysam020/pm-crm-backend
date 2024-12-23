import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const getStickyNote = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const data = await UserModel.findOne({ username });

    res.status(200).send(data.note);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getStickyNote;
