import UserModel from "../../model/userModel.mjs";

const addStickyNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const username = req.user.username;

    // Find user and update note
    const updatedNote = await UserModel.findOneAndUpdate(
      { username },
      { note }
    );

    res
      .status(200)
      .send({ message: "Updated successfully", data: updatedNote });
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default addStickyNote;
