import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/api/login", async (req, res) => {
  const { username, password, userAgent, geolocation } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }

    bcrypt.compare(
      password,
      user.password,
      async (passwordErr, passwordResult) => {
        if (passwordErr) {
          console.error(passwordErr);
          return res.status(200).json({ message: "Something went wrong" });
        }

        if (passwordResult) {
          // Generate JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              username: user.username,
              role: user.role,
              first_name: user.first_name,
              middle_name: user.middle_name,
              last_name: user.last_name,
              employee_photo: user.employee_photo,
              email: user.email,
              modules: user.modules,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token expiration time
          );

          // Track session data
          const newSession = {
            sessionID: token, // Use the token as sessionID (or generate a unique ID)
            loginAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
            ipAddress: req.ip, // Get the user's IP address
            userAgent: userAgent, // Store user agent from the request
            latitude: geolocation?.latitude || null, // Store user's latitude
            longitude: geolocation?.longitude || null, // Store user's longitude
          };

          // Add the new session to the user's sessions array
          user.sessions.push(newSession);

          // Save the updated user document
          await user.save();

          // Send the token in an HTTP-only cookie
          res.cookie("token", token, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            secure: false, // Set to true in production with HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour expiration
            sameSite: "Lax", // Allow cross-origin requests
          });

          res.status(200).json({
            message: "Login successful",
            user: {
              username: user.username,
              role: user.role,
              first_name: user.first_name,
              middle_name: user.middle_name,
              last_name: user.last_name,
              employee_photo: user.employee_photo,
              email: user.email,
              modules: user.modules,
            },
          });
        } else {
          return res
            .status(200)
            .json({ message: "Username or password didn't match" });
        }
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
