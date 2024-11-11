import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../../model/userModel.mjs";
import verifySession from "../../middlewares/verifySession.mjs";
import dotenv from "dotenv";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; // AWS SDK v3

dotenv.config();

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const router = express.Router();

const CLIENT_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_CLIENT_URI
    : process.env.DEV_CLIENT_URI;

router.post("/api/onboard-employee", verifySession, async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, employment_type } =
      req.body;
    const username = `${first_name.toLowerCase()}_${last_name.toLowerCase()}`;
    const password = "1234";

    // Check if there exists an employee with same username
    const existingEmployee = await UserModel.findOne({ username });

    if (existingEmployee) {
      return res.status(200).send({
        message: `Employee with username: ${username} already exists`,
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new UserModel({
      first_name: first_name.toUpperCase(),
      middle_name: middle_name ? middle_name.toUpperCase() : "",
      last_name: last_name.toUpperCase(),
      email,
      username,
      password: hashedPassword,
      modules: ["Employee KYC", "Employee Onboarding"],
      role: "User",
      employment_type: employment_type,
    });

    await newUser.save();

    // Prepare the email content (raw HTML)
    const emailBody = `
      <p>Dear ${first_name.toUpperCase()},</p>
      <p>Congratulations on your new role!</p>
      <p>We are pleased to have you join us and look forward to the positive impact you will bring to our team. Enclosed are your onboarding details and some resources to help you get started.</p>
      <ul>
        <li>Username: ${username}</li>
        <li>Password: ${password}</li>
        <li>URL: ${CLIENT_URI}</li>
      </ul>
      <p>Should you have any questions, please don't hesitate to ask.</p>
      <p>Welcome aboard!</p>
      <br />
      <p>Warm regards,</p>
      <p>Shalini Arun<br />HR & Admin<br />Suraj Forwarders Private Limited</p>
      <br />
      <img src="https://alvision-images.s3.ap-south-1.amazonaws.com/Shalini+Mam.jpg" alt="Email Signature" style="max-width: 100%; height: auto;" />
    `;

    // Prepare SES email parameters
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Welcome to the Team, ${first_name.toUpperCase()}!`,
        },
        Body: {
          Html: {
            Data: emailBody, // HTML formatted body
          },
        },
      },
    };

    // Send the email using AWS SES
    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    console.log("Message sent");
    res.status(201).send({ message: "User onboarded successfully" });
  } catch (error) {
    console.error("Error onboarding user:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
