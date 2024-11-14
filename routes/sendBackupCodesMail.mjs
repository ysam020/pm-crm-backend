/**
 * @swagger
 * /api/send-backup-codes-email:
 *   get:
 *     summary: Send backup codes via email
 *     description: This route sends an email to the user with their backup codes in a CSV format as an attachment. The email is sent using AWS SES, and the backup codes are decrypted before being attached as a CSV file.
 *     responses:
 *       200:
 *         description: Email sent successfully with the backup codes attached.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email sent successfully!"
 *       404:
 *         description: User not found in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error. Failed to send email due to server issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to send email"
 *     tags:
 *       - Backup Codes
 */

import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../model/userModel.mjs";
import dotenv from "dotenv";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { Buffer } from "buffer";
import verifySession from "../middlewares/verifySession.mjs";
import aesDecrypt from "../utils/aesDecrypt.mjs";
import { backupCodesTemplate } from "../templates/backupCodesTemplate.mjs";

dotenv.config();
const router = express.Router();

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

// Helper function to create a MIME formatted email
const createMimeEmail = (from, to, subject, bodyHtml, attachment) => {
  const boundary = "----=_Part_0_1234567890.0987654321";

  const emailBody = [
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    bodyHtml,
    `--${boundary}`,
    `Content-Type: text/csv; name="backup_codes.csv"`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="backup_codes.csv"`,
    "",
    attachment.toString("base64"),
    `--${boundary}--`,
  ].join("\n");

  return emailBody;
};

// Route to send backup codes via email
router.get("/api/send-backup-codes-email", verifySession, async (req, res) => {
  try {
    const token = res.locals.token;
    // Decode JWT to extract username
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Find the user in the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create CSV formatted string for backup codes
    const header = "Backup Codes\n";
    const csvContent = user.backupCodes
      .map((code) => `${aesDecrypt(code)}`)
      .join("\n");
    const csv = header + csvContent;

    // Create a buffer from the CSV content
    const csvBuffer = Buffer.from(csv);

    // Prepare the email body
    const bodyHtml = backupCodesTemplate(
      [user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(" ")
    );

    // Create the MIME email with the attachment
    const rawEmail = createMimeEmail(
      process.env.EMAIL_FROM, // From email address
      user.email, // To email address
      "Paymaster Backup Codes", // Subject
      bodyHtml, // HTML Body
      csvBuffer // Attachment
    );

    // Send the email using AWS SES
    const params = {
      RawMessage: {
        Data: rawEmail,
      },
    };

    const sendEmailCommand = new SendRawEmailCommand(params);
    try {
      await sesClient.send(sendEmailCommand);
    } catch (err) {
      console.error("Error sending email:", err);
    }

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

export default router;
