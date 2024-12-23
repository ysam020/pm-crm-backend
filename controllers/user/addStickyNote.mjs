import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const addStickyNote = async (req, res) => {
  try {
    const { note } = req.body;
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find user and update note
    const updatedNote = await UserModel.findOneAndUpdate(
      { username },
      { note }
    );

    res
      .status(200)
      .send({ message: "Sticky note updated successfully", data: updatedNote });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addStickyNote;
