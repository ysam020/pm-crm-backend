import jwt from "jsonwebtoken";
import UserModel from "../../model/userModel.mjs";

const verifyUser = async (req, res) => {
  try {
    const token = res.locals.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findOne({ username: decoded.username }).select(
      "username rank first_name middle_name last_name employee_photo email modules dob blood_group official_email mobile communication_address_line_1 communication_address_line_2 communication_address_city communication_address_state communication_address_pincode permanent_address_line_1 permanent_address_line_2 permanent_address_city permanent_address_state permanent_address_pincode designation department joining_date bank_account_no bank_name ifsc_code aadhar_no aadhar_photo_front pan_no pan_photo pf_no esic_no backupCodes isTwoFactorEnabled qrCodeImage"
    );
    const userResponse = user.toObject();

    // Decrypt backup codes if they exist
    if (userResponse.backupCodes && userResponse.backupCodes.length > 0) {
      userResponse.backupCodes = userResponse.backupCodes.map((code) =>
        user.decryptField("backupCodes", code)
      );
    }

    const fullName = user.getFullName();

    // Include sessionID inside the user object
    const userWithSessionID = {
      ...userResponse,
      sessionID: token,
      fullName,
    };

    res.status(200).json({ user: userWithSessionID });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid token" });
  }
};

export default verifyUser;
