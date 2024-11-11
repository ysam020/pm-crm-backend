/**
 * @swagger
 * /api/get-user-data/{username}:
 *   get:
 *     summary: Retrieve user data by username
 *     description: This endpoint retrieves the user data for the specified username, excluding sensitive fields like password, sessions, etc.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user whose data is being requested.
 *         schema:
 *           type: string
 *           example: "sameer_yadav"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data (excluding sensitive fields).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "6672a2501aa931b68b091faf"
 *                 first_name:
 *                   type: string
 *                   example: "FIRST NAME"
 *                 middle_name:
 *                   type: string
 *                   example: ""
 *                 last_name:
 *                   type: string
 *                   example: "LAST NAME"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Module 1", "Module 2"]
 *                 username:
 *                   type: string
 *                   example: "user_name"
 *                 role:
 *                   type: string
 *                   example: ""
 *                 insurance_status:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Insurance 1", "Insurance 2"]
 *                 address_proof:
 *                   type: string
 *                   example: "https://example.com/kyc/Aadhar%20Card.pdf"
 *                 company_policy_visited:
 *                   type: string
 *                   example: "Yes"
 *                 employee_photo:
 *                   type: string
 *                   example: "https://example.com/kyc/Photo.jpg"
 *                 skill:
 *                   type: string
 *                   example: "Skill"
 *                 aadhar_no:
 *                   type: string
 *                   example: "123456789012"
 *                 bank_account_no:
 *                   type: string
 *                   example: "1234567890"
 *                 bank_name:
 *                   type: string
 *                   example: "Bank Name"
 *                 blood_group:
 *                   type: string
 *                   example: "O+"
 *                 communication_address_city:
 *                   type: string
 *                   example: "City"
 *                 communication_address_line_1:
 *                   type: string
 *                   example: "Address Line 1"
 *                 communication_address_line_2:
 *                   type: string
 *                   example: "Address Line 2"
 *                 communication_address_pincode:
 *                   type: string
 *                   example: "123456"
 *                 communication_address_state:
 *                   type: string
 *                   example: "State"
 *                 department:
 *                   type: string
 *                   example: "Department"
 *                 designation:
 *                   type: string
 *                   example: "Designation"
 *                 dob:
 *                   type: string
 *                   example: "yyyy-mm-dd"
 *                 highest_qualification:
 *                   type: string
 *                   example: "Qualification"
 *                 ifsc_code:
 *                   type: string
 *                   example: "IFSC1234"
 *                 joining_date:
 *                   type: string
 *                   example: "yyyy-mm-dd"
 *                 kyc_approval:
 *                   type: string
 *                   example: "Pending"
 *                 kyc_date:
 *                   type: string
 *                   example: "yyyy-mm-dd"
 *                 mobile:
 *                   type: string
 *                   example: "9876543210"
 *                 official_email:
 *                   type: string
 *                   example: "official@example.com"
 *                 pan_no:
 *                   type: string
 *                   example: "PAN1234"
 *                 permanent_address_city:
 *                   type: string
 *                   example: "City"
 *                 permanent_address_line_1:
 *                   type: string
 *                   example: "Address Line 1"
 *                 permanent_address_line_2:
 *                   type: string
 *                   example: "Address Line 2"
 *                 permanent_address_pincode:
 *                   type: string
 *                   example: "123456"
 *                 permanent_address_state:
 *                   type: string
 *                   example: "State"
 *                 pf_no:
 *                   type: string
 *                   example: ""
 *       404:
 *         description: User not found for the given username.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong"
 *     tags:
 *       - Admin
 */

import express from "express";
import UserModel from "../model/userModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-user-data/:username", verifySession, async (req, res) => {
  try {
    const { username } = req.params;
    // Exclude sensitive fields
    const user = await UserModel.findOne({ username }).select(
      "-password -sessions -resetPasswordOTP -resetPasswordExpires -failedLoginAttempts -firstFailedLoginAt -isBlocked -blockedUntil -isTwoFactorEnabled -twoFactorSecret -qrCodeImage -backupCodes -webAuthnCredentials -fcmTokens"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
