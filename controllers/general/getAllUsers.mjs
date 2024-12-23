import UserModel from "../../model/userModel.mjs";

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}).select("username");
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while fetching users. Please try again later.",
    });
  }
};

export default getAllUsers;
