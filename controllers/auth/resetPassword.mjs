import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const resetPassword = async (req, res) => {
  try {
    const token = res.locals.token;
    const { password, new_password } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const username = jwt.verify(token, process.env.JWT_SECRET).username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(409).json({ message: "Incorrect password" });
    }

    // Update the user's password in the database
    user.password = new_password;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default resetPassword;
