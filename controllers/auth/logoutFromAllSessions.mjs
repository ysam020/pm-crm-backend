import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const logoutFromAllSessions = async (req, res) => {
  try {
    const token = res.locals.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user by their username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all sessions associated with the user
    await UserModel.updateOne(
      { username },
      { $set: { sessions: [] } } // Clear all sessions
    );

    // Optionally, invalidate the token (e.g., remove it from cookies)
    res.clearCookie("token"); // Clear the JWT cookie

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default logoutFromAllSessions;
