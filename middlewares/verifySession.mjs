import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../model/userModel.mjs";

dotenv.config();

const verifySession = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    let user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(403).json({ message: "Forbidden: User not found" });
    }

    // Get current time for session checks
    const now = new Date();

    // Clean up expired sessions
    user.sessions = user.sessions.filter((session) => session.expiresAt > now);
    await user.updateOne({ sessions: user.sessions });

    // Check if the session exists in the user's sessions after cleanup
    const sessionIndex = user.sessions.findIndex(
      (session) => session.sessionID === token
    );

    if (sessionIndex === -1) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      });
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired session" });
    }

    // Attach the new token to res.locals for use in the route
    res.locals.token = token;

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err);

    // Clear the cookie if the token is invalid
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

export default verifySession;
