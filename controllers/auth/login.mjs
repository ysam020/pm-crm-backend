/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: >
 *       This endpoint logs in a user by validating their credentials. The login process includes the following steps:
 *
 *       1. **Basic Authentication**: The user provides a `username` and `password`.
 *          - **Correct Password**: Proceed to two-factor authentication if enabled.
 *          - **Incorrect Password**: The server increments the failed login attempt counter for the user, and the user receives a warning mail that there has been a login attempt on their account with incorrect credentials. If the number of attempts reaches a configured threshold, the account is temporarily blocked.
 *          - **Blocked Account**: If the account is blocked due to repeated failed attempts, the response includes an `unblockTime`, informing the user when they can try logging in again. Or they can reset their password to unblock their account.
 *       2. **Two-Factor Authentication (2FA)**:
 *          - If `isTwoFactorEnabled` is true, the user must provide a valid `twoFAToken`.
 *          - Alternatively, if `useBackupCode` is true, the user can provide a `backupCode`. In this case, password is not required.
 *
 *       3. **Device and Location Tracking**:
 *          - The client should send additional details like `userAgent` (to identify the browser or device) and `geolocation` data (`latitude`, `longitude`).
 *
 *       4. **Response Handling**:
 *          - If login is successful, user data and `sessionID` (JWT token) are returned.
 *          - If the account is blocked, a 403 response with an `unblockTime` is sent.
 *          - If login fails due to an unregistered user, a 404 response is sent.
 *
 *       5. **Error Codes**:
 *          - This endpoint provides different responses based on the login attempt, including codes for unauthorized access, account blocking, and unregistered users.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user_name"
 *               password:
 *                 type: string
 *                 example: "1234"
 *               twoFAToken:
 *                 type: string
 *                 example: "123456"
 *               backupCode:
 *                 type: string
 *                 example: "12345678"
 *               userAgent:
 *                 type: string
 *                 example: "Mozilla/5.0"
 *               geolocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 37.7749
 *                   longitude:
 *                     type: number
 *                     example: -122.4194
 *               isTwoFactorEnabled:
 *                 type: boolean
 *                 example: false
 *               useBackupCode:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Login successful or with messages on unsuccessful attempts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "user_name"
 *                     rank:
 *                       type: Number
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     middle_name:
 *                       type: string
 *                       example: "A."
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     employee_photo:
 *                       type: string
 *                       example: "url_to_photo"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "dashboard"
 *                     sessionID:
 *                       type: string
 *                       example: "jwt_token_here"
 *                     fullName:
 *                       type: string
 *                       example: "John A. Doe"
 *                 unblockTime:
 *                   type: string
 *                   example: "2024-12-01T23:59:59.000Z"
 *       400:
 *         description: Bad Request - missing required fields or invalid data.
 *       401:
 *         description: Unauthorized - failed authentication.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid 2FA token"
 *       403:
 *         description: Account blocked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account blocked until 2023-12-31T23:59:59.000Z. You can try resetting your password."
 *       404:
 *         description: User not registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not registered"
 *       500:
 *         description: Internal Server Error - an error occurred on the server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Authentication
 */

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

    const fullName = user.getFullName();
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
        fullName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default login;
