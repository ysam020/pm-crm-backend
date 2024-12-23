import UserModel from "../../model/userModel.mjs";

const getUserModules = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username }).select(
      "username modules"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default getUserModules;
