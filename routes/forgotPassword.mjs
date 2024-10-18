import express from "express";
import sgMail from "@sendgrid/mail";
import User from "../model/userModel.mjs";

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define the forgot password route
router.post("/api/forgot-password", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 360000; // 6 minutes
    await user.save();

    // Send email with OTP
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Password Reset OTP",
      html: `You are receiving this because you have requested the reset of the password for your account.
        <br /><br />
        Your OTP is: <strong>${otp}</strong>
        <br /><br />
        This OTP is valid for 6 minutes. Please do not share it with anyone.`,
    };

    await sgMail.send(msg);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
