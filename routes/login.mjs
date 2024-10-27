import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs";
import speakeasy from "speakeasy";
import aws from "aws-sdk";
import nodemailer from "nodemailer";

// Configure AWS SDK
aws.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

// Create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: new aws.SES({ apiVersion: "2010-12-01" }),
});

const router = express.Router();

router.post("/api/login", async (req, res) => {
  const { username, password, twoFAToken, backupCode, userAgent, geolocation } =
    req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }

    // Check if user is blocked
    const currentDate = new Date();
    if (user.isBlocked && user.blockedUntil > currentDate) {
      return res.status(200).json({
        message: `Account is blocked till ${user.blockedUntil}. You can try resetting your password.`,
      });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Set the firstFailedLoginAt time if it's the first attempt
      if (user.failedLoginAttempts === 1) {
        user.firstFailedLoginAt = new Date();
      }

      // Check how many attempts are left before blocking
      const attemptsLeft = 3 - user.failedLoginAttempts;

      // Check if failed attempts exceed the limit
      if (user.failedLoginAttempts >= 3) {
        user.isBlocked = true;
        user.blockedUntil = new Date(currentDate.setHours(23, 59, 59, 999)); // Block until end of the day
      }

      await user.save();

      // Prepare response message
      let responseMessage = "Username or password didn't match.";
      if (user.isBlocked) {
        responseMessage = `Account is blocked till ${user.blockedUntil}. You can try resetting your password.`;
      } else {
        responseMessage += ` You have ${attemptsLeft} attempts left before your account is blocked.`;

        // Send email notification only if the account is NOT blocked
        const mailOptions = {
          to: user.email,
          from: process.env.EMAIL_FROM,
          subject: "Login Attempt Warning",
          text: `Dear ${user.username}, there has been a failed login attempt on your account. If this was not you, please take appropriate actions to secure your account.`,
          html: `<p>Dear ${user.username},</p><p>There has been a failed login attempt on your account. If this was not you, please <strong>change your password</strong> immediately.</p>`,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (err) {
          console.error("Error sending email:", err);
        }
      }

      return res.status(200).json({
        message: responseMessage,
        unblockTime: user.isBlocked ? user.blockedUntil : null,
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.firstFailedLoginAt = null;
    user.isBlocked = false;
    user.blockedUntil = null;

    // Check if using backup code
    if (backupCode) {
      // Validate backup code
      const codeIndex = user.backupCodes.indexOf(backupCode);
      if (codeIndex === -1) {
        return res.status(200).json({ message: "Invalid backup code" });
      }

      // Remove the backup code from the array
      user.backupCodes.splice(codeIndex, 1);
    } else if (user.twoFactorSecret) {
      // Verify 2FA token if 2FA is enabled
      const isTokenValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFAToken,
      });

      if (!isTokenValid) {
        return res.status(200).json({ message: "Invalid 2FA token" });
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
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
      sessionID: jwtToken,
      loginAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
      ipAddress: req.ip,
      userAgent: userAgent,
      latitude: geolocation?.latitude || null,
      longitude: geolocation?.longitude || null,
    };

    // Add the new session to the user's sessions array
    user.sessions.push(newSession);

    // Save the updated user document
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
        role: user.role,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        employee_photo: user.employee_photo,
        email: user.email,
        modules: user.modules,
        sessionID: jwtToken,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
