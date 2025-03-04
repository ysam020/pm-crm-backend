/**
 * @swagger
 * /api/send-forgot-password-otp:
 *   post:
 *     summary: Request password reset OTP
 *     description: Sends a one-time password (OTP) to the user's email for password reset. The OTP is valid for 5 minutes.
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
 *     responses:
 *       200:
 *         description: OTP sent successfully to the user's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your email"
 *       400:
 *         description: Bad Request - Missing username or invalid format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing username or invalid format"
 *       404:
 *         description: User not found - No user found with the provided username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - Error sending the email or processing the OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *     tags:
 *       - Authentication
 */

import User from "../../model/userModel.mjs";
import { forgotPasswordTemplate } from "../../templates/forgotPasswordTemplate.mjs";
import { emailQueue } from "../../config/queueConfig.mjs";

const sendForgotPasswordOtp = async (req, res, next) => {
  try {
    const { username } = req.body;

    // Validate the request body
    if (!username) {
      return res
        .status(400)
        .json({ message: "Missing username or invalid format" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    user.encryptField("resetPasswordOTP", otp);
    user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    // Set up the email parameters
    const html = forgotPasswordTemplate(user.username, otp);

    res.status(200).json({ message: "OTP sent to your email" });

    await emailQueue.add(
      "send-mail",
      {
        from: process.env.EMAIL_FROM, // Sender email address (configured in .env)
        to: user.email, // Recipient email address
        subject: "Password Reset OTP",
        html: html, // The email HTML template content
      },
      {
        attempts: 2, // Number of retry attempts if job fails
        backoff: {
          type: "exponential",
          delay: 1000, // 1 second initial delay
        },
      }
    );
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default sendForgotPasswordOtp;
