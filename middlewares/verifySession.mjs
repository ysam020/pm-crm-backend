import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../model/userModel.mjs";

dotenv.config();

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request object
    req.user = decoded;

    // Find the user in the database
    const username = decoded.username;
    const user = await UserModel.findOne({ username });

    if (!user) {
      // User not found in the database
      return res.status(200).json({ message: "Forbidden: User not found" });
    }

    // Get current time for session checks
    const now = new Date();

    // Clean up expired sessions
    user.sessions = user.sessions.filter((session) => session.expiresAt > now);

    // Check if the session exists in the user's sessions after cleanup
    const sessionExists = user.sessions.some(
      (session) => session.sessionID === token
    );

    if (!sessionExists) {
      // Clear the cookie if the session does not exist (invalid or expired)
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "None",
      });
      return res
        .status(200)
        .json({ message: "Forbidden: Invalid or expired session" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Token verification error:", err);

    // Clear the cookie if the token is invalid
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set this to true in production if using HTTPS
      sameSite: "None",
    });

    return res.status(200).json({ message: "Forbidden: Invalid token" });
  }
};

export default verifySession;
