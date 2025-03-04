import UserModel from "../../model/userModel.mjs";

const getUserData = async (req, res, next) => {
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
    next(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default getUserData;
