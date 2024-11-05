import express from "express";
import aws from "aws-sdk";
import nodemailer from "nodemailer";
import User from "../model/userModel.mjs";

// Configure AWS SDK
aws.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

// Create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: new aws.SES({ apiVersion: "2010-12-01" }),
});

const router = express.Router();

router.post("/api/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    // Send email with OTP
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Password Reset OTP",
      html: `You are receiving this because you have requested the reset of the password for your account.
        <br /><br />
        Your OTP is: <strong>${otp}</strong>
        <br /><br />
        This OTP is valid for 5 minutes. Please do not share it with anyone.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("Error sending email:", err);
    }
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
