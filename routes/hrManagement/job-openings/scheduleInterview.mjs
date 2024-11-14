/**
 * @swagger
 * /api/schedule-interview:
 *   put:
 *     summary: Schedule an interview and send an email invite
 *     description: This route schedules an interview for a job application and sends an email to the candidate with an ICS calendar invite.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *               email:
 *                 type: string
 *                 example: "candidate@example.com"
 *               interviewDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-15T10:00:00Z"
 *               interviewStartTime:
 *                 type: string
 *                 format: time
 *                 example: "10:00:00"
 *               interviewEndTime:
 *                 type: string
 *                 format: time
 *                 example: "11:00:00"
 *     responses:
 *       200:
 *         description: Interview successfully scheduled and email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Interview scheduled"
 *       404:
 *         description: Job application not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application not found"
 *       500:
 *         description: Internal server error when sending the email or saving the interview date.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to schedule interview"
 *     tags:
 *       - Job Applications
 */

// import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
// import express from "express";
// import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
// import verifySession from "../../../middlewares/verifySession.mjs";
// import { Buffer } from "buffer";
// import { interviewTemplate } from "../../../templates/interviewTemplate.mjs";

// const router = express.Router();

// // Configure AWS SES Client
// const sesClient = new SESClient({
//   region: process.env.REGION, // e.g., "ap-south-1"
//   credentials: {
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   },
// });

// router.put("/api/schedule-interview", verifySession, async (req, res) => {
//   try {
//     const {
//       jobTitle,
//       name,
//       email,
//       interviewDateTime,
//       interviewStartTime,
//       interviewEndTime,
//     } = req.body;

//     const application = await JobApplicationModel.findOne({
//       jobTitle,
//       email,
//     });

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     application.interviewDate = interviewDateTime;
//     await application.save();

//     // Prepare Calendar Event (ICS content)
//     const icsContent = `BEGIN:VCALENDAR\r
// VERSION:2.0\r
// CALSCALE:GREGORIAN\r
// BEGIN:VEVENT\r
// SUMMARY:Interview for ${jobTitle}\r
// DTSTART;TZID=Asia/Kolkata:${interviewStartTime}\r
// DTEND;TZID=Asia/Kolkata:${interviewEndTime}\r
// LOCATION:Paymaster Management Solutions, 2nd Floor, Maradia Plaza, CG Road, Ahmedabad, Gujarat, 380006\r
// DESCRIPTION:Interview for ${jobTitle}\r
// STATUS:CONFIRMED\r
// SEQUENCE:0\r
// BEGIN:VALARM\r
// TRIGGER:-PT1H\r
// DESCRIPTION:Interview Reminder\r
// ACTION:DISPLAY\r
// END:VALARM\r
// END:VEVENT\r
// END:VCALENDAR`;

//     // Encode ICS content in Base64
//     const icsBase64 = Buffer.from(icsContent, "utf-8").toString("base64");

//     // Define MIME boundary
//     const mimeBoundary = "NextPart";

//     // Use the email template in the MIME message
//     const htmlEmailContent = interviewTemplate(
//       jobTitle,
//       interviewDateTime,
//       name
//     );

//     // Construct MIME message
//     const mimeMessage = [
//       `From: ${process.env.EMAIL_FROM}`,
//       `To: ${email}`,
//       `Subject: Paymaster Interview Scheduled for ${jobTitle}`,
//       "MIME-Version: 1.0",
//       `Content-Type: multipart/mixed; boundary="${mimeBoundary}"`,
//       "",
//       `--${mimeBoundary}`,
//       "Content-Type: text/html; charset=UTF-8",
//       "",
//       htmlEmailContent,
//       "",
//       `--${mimeBoundary}`,
//       "Content-Type: text/calendar; charset=UTF-8; method=REQUEST",
//       "Content-Transfer-Encoding: base64",
//       'Content-Disposition: attachment; filename="interview.ics"',
//       "",
//       `${icsBase64}`,
//       "",
//       `--${mimeBoundary}--`,
//       "",
//     ].join("\r\n");

//     // Set up email parameters
//     const emailParams = {
//       Source: process.env.EMAIL_FROM,
//       Destinations: [email],
//       RawMessage: {
//         Data: Buffer.from(mimeMessage),
//       },
//     };

//     // Send email
//     const command = new SendRawEmailCommand(emailParams);
//     const response = await sesClient.send(command);

//     res.status(200).json({
//       message: "Interview scheduled and email sent",
//       messageId: response.MessageId,
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ message: "Failed to schedule interview" });
//   }
// });

// export default router;

import express from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../../model/userModel.mjs";
import dotenv from "dotenv";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { Buffer } from "buffer";
import verifySession from "../../../middlewares/verifySession.mjs";
import aesDecrypt from "../../../utils/aesDecrypt.mjs";

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

// Helper function to create a MIME formatted email with CSV attachment
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
    const bodyHtml = `
      <p>Dear ${[user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(" ")},</p>
      <p>Please find attached the backup codes below for your Paymaster account.</p>
      <p>Best regards,
      <br />
      Your Paymaster Team
      </p>
    `;

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
