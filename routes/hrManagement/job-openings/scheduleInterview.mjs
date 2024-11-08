import express from "express";
import JobApplicationModel from "../../../model/jobApplicationModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";
import aws from "aws-sdk";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";

const router = express.Router();

// Configure AWS SES
aws.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Create transporter with nodemailer
let transporter = nodemailer.createTransport({
  SES: new aws.SES({ apiVersion: "2010-12-01" }),
});

router.post("/api/schedule-interview", verifySession, async (req, res) => {
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
      return res.status(200).json({ message: "Application not found" });
    }

    application.interviewDate = interviewDateTime;
    await application.save();

    // Prepare Calendar Event
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

    // Create ICS file from the calendar event
    const icsBuffer = Buffer.from(icsContent, "utf-8");

    // Prepare the email with the attachment
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Interview Scheduled for ${jobTitle}`,
      html: `
      <p>Dear candidate,</p>
      <p>Your interview for the position of <strong>${jobTitle}</strong> is scheduled for <strong>${interviewDateTime}</strong>.</p>
      <p>Please find the details in the attached calendar invite.</p>
      <br />
      <p>Best regards,<br />Your HR Team</p>
      `,
      attachments: [
        {
          filename: "interview.ics",
          content: icsBuffer,
          encoding: "base64",
          contentType: "text/calendar",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("Error sending email:", err);
    }

    res.status(200).json({ message: "Interview scheduled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
