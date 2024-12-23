import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";
import speakeasy from "speakeasy";
import { loginAlertTemplate } from "../../templates/loginAlertTemplate.mjs";
import transporter from "../../utils/transporter.mjs";

const login = async (req, res) => {
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
      return res.status(404).json({ message: "User not registered" });
    }

    // Check if user is blocked
    const currentDate = new Date();
    if (user.isBlocked && user.blockedUntil > currentDate) {
      return res.status(403).json({
        message: `Account is blocked till ${user.blockedUntil}. You can try resetting your password.`,
      });
    }

    // Check if using backup code for login
    if (useBackupCode) {
      // If using backup code, validate it
      const codeIndex = user.backupCodes.findIndex(
        (encryptedCode) =>
          user.decryptField("backupCodes", encryptedCode) === backupCode
      );

      if (codeIndex === -1) {
        return res.status(400).json({ message: "Invalid backup code" });
      }

      // Remove the used backup code and save user
      user.backupCodes.splice(codeIndex, 1);
      await user.save(); // Save the user after removing the backup code
    } else {
      // Proceed with normal login flow, checking password
      const passwordMatch = await user.isPasswordCorrect(password);
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

          const html = loginAlertTemplate(user.username);

          // Send warning email using Nodemailer
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_FROM, // Sender email address (configured in .env)
              to: user.email, // Recipient email address
              subject: "Login Attempt Warning",
              html: html, // The email HTML template content
            });
          } catch (err) {
            console.error("Error sending email with Nodemailer:", err);
          }
        }

        return res.status(400).json({
          message: responseMessage,
          unblockTime: user.isBlocked ? user.blockedUntil : null,
        });
      }

      // Reset failed attempts on successful password login
      user.resetBlockStatus();

      // Handle Two-Factor Authentication if enabled
      if (isTwoFactorEnabled) {
        if (user.twoFactorSecret) {
          const isTokenValid = speakeasy.totp.verify({
            secret: user.decryptField("twoFactorSecret", user.twoFactorSecret),
            encoding: "base32",
            token: twoFAToken,
          });

          if (!isTokenValid) {
            return res.status(401).json({ message: "Invalid 2FA token" });
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
        department: user.department,
        rank: user.rank,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.addSession(
      jwtToken,
      userAgent,
      geolocation?.latitude,
      geolocation?.longitude
    );

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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default login;
