/**
 * @swagger
 * /api/verify-user:
 *   get:
 *     summary: Verify user session and fetch user details
 *     description: This route verifies the session of the user using a JWT token. If the token is valid, it retrieves the user's details from the database, including personal, contact, and work-related information, and returns them in the response. It also decrypts the backup codes if they exist and includes the session ID and full name in the response.
 *     responses:
 *       200:
 *         description: User details successfully fetched and returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     middle_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     employee_photo:
 *                       type: string
 *                     email:
 *                       type: string
 *                     modules:
 *                       type: array
 *                       items:
 *                         type: string
 *                     dob:
 *                       type: string
 *                       format: date
 *                     blood_group:
 *                       type: string
 *                     official_email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     communication_address_line_1:
 *                       type: string
 *                     communication_address_line_2:
 *                       type: string
 *                     communication_address_city:
 *                       type: string
 *                     communication_address_state:
 *                       type: string
 *                     communication_address_pincode:
 *                       type: string
 *                     permanent_address_line_1:
 *                       type: string
 *                     permanent_address_line_2:
 *                       type: string
 *                     permanent_address_city:
 *                       type: string
 *                     permanent_address_state:
 *                       type: string
 *                     permanent_address_pincode:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     department:
 *                       type: string
 *                     joining_date:
 *                       type: string
 *                       format: date
 *                     bank_account_no:
 *                       type: string
 *                     bank_name:
 *                       type: string
 *                     ifsc_code:
 *                       type: string
 *                     aadhar_no:
 *                       type: string
 *                     aadhar_photo_front:
 *                       type: string
 *                     pan_no:
 *                       type: string
 *                     pan_photo:
 *                       type: string
 *                     pf_no:
 *                       type: string
 *                     esic_no:
 *                       type: string
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isTwoFactorEnabled:
 *                       type: boolean
 *                     qrCodeImage:
 *                       type: string
 *                     sessionID:
 *                       type: string
 *       403:
 *         description: Unauthorized or invalid token. The token used for session verification is invalid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token"
 *     tags:
 *       - Authentication
 */

import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const verifyUser = async (req, res, next) => {
  try {
    const cacheKey = `user:${req.user.username}`;

    // Check if user data is cached
    const cachedUser = await getCachedData(cacheKey);
    if (cachedUser) {
      return res.status(200).json({ user: cachedUser });
    }

    // Fetch user from MongoDB
    const user = await UserModel.findOne({
      username: req.user.username,
    }).select(
      "username rank first_name middle_name last_name employee_photo email modules dob blood_group official_email mobile communication_address_line_1 communication_address_line_2 communication_address_city communication_address_state communication_address_pincode permanent_address_line_1 permanent_address_line_2 permanent_address_city permanent_address_state permanent_address_pincode designation department joining_date bank_account_no bank_name ifsc_code aadhar_no aadhar_photo_front pan_no pan_photo pf_no esic_no backupCodes isTwoFactorEnabled qrCodeImage twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();

    // Decrypt sensitive fields
    if (userResponse.backupCodes?.length > 0) {
      userResponse.backupCodes = userResponse.backupCodes.map((code) =>
        user.decryptField("backupCodes", code)
      );
    }

    if (userResponse.twoFactorSecret) {
      userResponse.twoFactorSecret = user.decryptField(
        "twoFactorSecret",
        user.twoFactorSecret
      );
    }

    // Add full name using Mongoose method
    userResponse.full_name = user.getFullName();

    // Cache the user response in Redis
    await cacheResponse(cacheKey, userResponse);

    res.status(200).json({ user: userResponse });
  } catch (err) {
    next(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default verifyUser;
