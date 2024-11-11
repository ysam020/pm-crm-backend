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

import express from "express";
import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; // AWS SDK v3
import { Buffer } from "buffer";

const router = express.Router();

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

router.put("/api/schedule-interview", verifySession, async (req, res) => {
  try {
    const {
      jobTitle,
      email,
      interviewDateTime,
      interviewStartTime,
      interviewEndTime,
    } = req.body;

    const application = await JobApplicationModel.findOne({
      jobTitle,
      email,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.interviewDate = interviewDateTime;
    await application.save();

    // Prepare Calendar Event (ICS content)
    const icsContent = `
    BEGIN:VCALENDAR
    VERSION:2.0
    CALSCALE:GREGORIAN
    BEGIN:VEVENT
    SUMMARY:Paymaster Interview
    DTSTART;TZID=Asia/Kolkata:${interviewStartTime}
    DTEND;TZID=Asia/Kolkata:${interviewEndTime}
    LOCATION:Paymaster Management Solutions, 2nd Floor, Maradia Plaza, CG Road, Ahmedabad, Gujarat, 380006
    DESCRIPTION:Paymaster Interview
    STATUS:CONFIRMED
    SEQUENCE:0
    BEGIN:VALARM
    TRIGGER:-PT1H
    DESCRIPTION:Paymaster Interview Reminder
    ACTION:DISPLAY
    END:VALARM
    END:VEVENT
    END:VCALENDAR`;

    // Create ICS file from the calendar event content
    const icsBuffer = Buffer.from(icsContent, "utf-8");

    // Prepare email parameters for AWS SES
    const emailParams = {
      Source: process.env.EMAIL_FROM, // Make sure this email is verified in SES
      Destination: {
        ToAddresses: [email], // The candidate's email address
      },
      Message: {
        Subject: {
          Data: `Interview Scheduled for ${jobTitle}`,
        },
        Body: {
          Html: {
            Data: `
              <p>Dear candidate,</p>
              <p>Your interview for the position of <strong>${jobTitle}</strong> is scheduled for <strong>${new Date(
              interviewDateTime
            ).toLocaleString()}</strong>.</p>
              <p>Please find the details in the attached calendar invite.</p>
              <br />
              <p>Best regards,<br />Your HR Team</p>
            `,
          },
        },
      },
      Attachments: [
        {
          Filename: "interview.ics",
          Data: icsBuffer,
          ContentType: "text/calendar",
        },
      ],
    };

    // Send the email using AWS SES
    const sendEmailCommand = new SendEmailCommand(emailParams);
    await sesClient.send(sendEmailCommand);

    res.status(200).json({ message: "Interview scheduled" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed to schedule interview" });
  }
});

export default router;
