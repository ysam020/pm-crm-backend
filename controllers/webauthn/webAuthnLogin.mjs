import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const authenticateUser = async (user, res, userAgent, geolocation) => {
  // Generate JWT token
  const jwtToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      department: user.department,
      rank: user.rank,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Add the new session to the user's sessions array
  user.addSession(
    jwtToken,
    userAgent,
    geolocation?.latitude,
    geolocation?.longitude
  );

  await user.save();

  // Send the token in an HTTP-only cookie
  res.cookie("token", jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60 * 1000, // 1 hour expiration
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      username: user.username,
      rank: user.rank,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      employee_photo: user.employee_photo,
      email: user.email,
      modules: user.modules,
      sessionID: jwtToken,
    },
  });
};

const webAuthnLogin = async (req, res) => {
  const { username, userAgent, geolocation } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }

    // Proceed to authenticate user after successful WebAuthn verification
    await authenticateUser(user, res, userAgent, geolocation, req.ip);
  } catch (err) {
    console.error("WebAuthn login error:", err);
    return res.status(500).json({ message: "WebAuthn login failed" });
  }
};

export default webAuthnLogin;
