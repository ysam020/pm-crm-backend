import express from "express";
import jwt from "jsonwebtoken";
import verifySession from "../middlewares/verifySession.mjs";

import UserModel from "../model/userModel.mjs";

const router = express.Router();

router.get("/api/verify-user", verifySession, async (req, res) => {

  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(200).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findOne({ username: decoded.username }).select(
      "username role first_name middle_name last_name employee_photo email modules dob blood_group official_email mobile communication_address_line_1 communication_address_line_2 communication_address_city communication_address_state communication_address_pincode permanent_address_line_1 permanent_address_line_2 permanent_address_city permanent_address_state permanent_address_pincode designation department joining_date bank_account_no bank_name ifsc_code aadhar_no aadhar_photo_front pan_no pan_photo pf_no esic_no backupCodes isTwoFactorEnabled qrCodeImage"
    );
    const userResponse = user.toObject();
    // Include sessionID inside the user object
    const userWithSessionID = { ...userResponse, sessionID: token };

    res.json({ user: userWithSessionID });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;

