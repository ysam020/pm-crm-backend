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
  try {
    const {
      username,
      password,
      twoFAToken,
      backupCode,
      userAgent,
      geolocation,
      isTwoFactorEnabled,
      useBackupCode,
    } = req.body;
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

    // Check if using backup code for login
    if (useBackupCode) {
      // If using backup code, validate it
      const codeIndex = user.backupCodes.indexOf(backupCode);
      if (codeIndex === -1) {
        return res.status(200).json({ message: "Invalid backup code" });
      }

      // Remove the used backup code and save user
      user.backupCodes.splice(codeIndex, 1);
      await user.save(); // Save the user after removing the backup code
    } else {
      // Proceed with normal login flow, checking password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts === 1) {
          user.firstFailedLoginAt = new Date();
        }

        const attemptsLeft = 3 - user.failedLoginAttempts;

        if (user.failedLoginAttempts >= 3) {
          user.isBlocked = true;
          user.blockedUntil = new Date(currentDate.setHours(23, 59, 59, 999));
        }

        await user.save();

        let responseMessage = "Username or password didn't match.";
        if (user.isBlocked) {
          responseMessage = `Account is blocked till ${user.blockedUntil}. You can try resetting your password.`;
        } else {
          responseMessage += ` You have ${attemptsLeft} attempts left before your account is blocked.`;

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

      // Reset failed attempts on successful password login
      user.failedLoginAttempts = 0;
      user.firstFailedLoginAt = null;
      user.isBlocked = false;
      user.blockedUntil = null;

      // Handle Two-Factor Authentication if enabled
      if (isTwoFactorEnabled) {
        if (user.twoFactorSecret) {
          const isTokenValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: twoFAToken,
          });

          if (!isTokenValid) {
            return res.status(200).json({ message: "Invalid 2FA token" });
          }
        } else {
          return res.status(400).json({ message: "2FA token is required." });
        }
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const newSession = {
      sessionID: jwtToken,
      loginAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      userAgent: userAgent,
      latitude: geolocation?.latitude || null,
      longitude: geolocation?.longitude || null,
      ipAddress: geolocation?.ipAddress || null,
    };

    user.sessions.push(newSession);

    await user.save();

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 1000,
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
