import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const requestNewBackupCodes = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user by username extracted from the token
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new backup codes using the schema method
    const newBackupCodes = user.generateBackupCodes();

    // Save the updated user with the new backup codes
    await user.save();

    res.status(200).json({
      message: "New backup codes generated",
      backupCodes: newBackupCodes, // Send the new codes to the frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating new backup codes" });
  }
};

export default requestNewBackupCodes;
