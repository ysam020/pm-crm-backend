import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";
import dotenv from "dotenv";
import { backupCodesTemplate } from "../../templates/backupCodesTemplate.mjs";
import transporter from "../../utils/transporter.mjs";

dotenv.config();

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

const sendBackupCodesMail = async (req, res) => {
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
      .map((code) => `${user.decryptField("backupCodes", code)}`)
      .join("\n");
    const csv = header + csvContent;

    // Create a buffer from the CSV content
    const csvBuffer = Buffer.from(csv);

    const fullName = user.getFullName();

    // Prepare the email body
    const bodyHtml = backupCodesTemplate(fullName);

    // Create the MIME email with the attachment
    const rawEmail = createMimeEmail(
      process.env.EMAIL_FROM, // From email address
      user.email, // To email address
      "Paymaster Backup Codes", // Subject
      bodyHtml, // HTML Body
      csvBuffer // Attachment
    );

    // Send the email using Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Paymaster Backup Codes",
      raw: rawEmail, // Raw email with attachment and MIME formatting
    };

    try {
      // Send the email via SMTP
      const a = await transporter.sendMail(mailOptions);
      console.log(a);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).json({ message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

export default sendBackupCodesMail;
