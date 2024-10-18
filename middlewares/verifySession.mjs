import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../model/userModel.mjs"; // Adjust the path as necessary

dotenv.config();

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request object
    req.user = decoded; // This will contain the user information decoded from the token

    // Find the user in the database
    const username = decoded.username;
    const user = await UserModel.findOne({ username });

    if (!user) {
      // User not found in the database
      return res.status(200).json({ message: "Forbidden: User not found" });
    }

    // Check if the session exists in the user's sessions
    const sessionExists = user.sessions.some(
      (session) => session.sessionID === token
    );

    if (!sessionExists) {
      // Clear the cookie if the session does not exist
      res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Set this to true in production if using HTTPS
        sameSite: "Lax",
      });
      return res.status(200).json({ message: "Forbidden: Invalid session" });
    }

    // If the session is valid, update the session expiration time
    const now = new Date();
    user.sessions = user.sessions.map((session) => {
      if (session.sessionID === token) {
        session.expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // Extend session expiration by 1 hour
      }
      return session;
    });

    // Save the updated user document
    await user.save();

    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err);

    // Clear the cookie if the token is invalid
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set this to true in production if using HTTPS
      sameSite: "Lax",
    });

    return res.status(200).json({ message: "Forbidden: Invalid token" });
  }
};

export default verifySession;
