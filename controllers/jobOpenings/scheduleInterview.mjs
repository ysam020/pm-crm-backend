import JobApplicationModel from "../../model/jobApplicationModel.mjs";
import transporter from "../../utils/transporter.mjs";
import { Buffer } from "buffer";

const scheduleInterview = async (req, res) => {
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

    if (application.status === "Hired") {
      return res.status(409).json({ message: "Candidate already hired" });
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

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Interview Scheduled for ${jobTitle}`,
        html: `
          <p>Dear candidate,</p>
          <p>Your interview for the position of <strong>${jobTitle}</strong> is scheduled for <strong>${new Date(
          interviewDateTime
        ).toLocaleString()}</strong>.</p>
          <p>Please find the details in the attached calendar invite.</p>
          <br />
          <p>Best regards,<br />Your HR Team</p>
        `,
        attachments: [
          {
            filename: "interview.ics", // Filename for the ICS file
            content: icsBuffer, // Attach the ICS file buffer
            contentType: "text/calendar", // MIME type for calendar events
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }

    res.status(200).json({ message: "Interview scheduled" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed to schedule interview" });
  }
};

export default scheduleInterview;