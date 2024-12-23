import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const deleteBackupCodes = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete backup codes by setting the array to empty
    user.backupCodes = [];

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Backup codes deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting backup codes" });
  }
};

export default deleteBackupCodes;
