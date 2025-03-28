import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const getUserData = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cacheKey = `userData:${username}`;

    // Check Redis cache first
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Fetch from MongoDB if not found in cache
    const user = await UserModel.findOne({ username }).select(
      "-password -sessions -resetPasswordOTP -resetPasswordExpires -failedLoginAttempts -firstFailedLoginAt -isBlocked -blockedUntil -isTwoFactorEnabled -twoFactorSecret -qrCodeImage -backupCodes -webAuthnCredentials -fcmTokens"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cache the response
    await cacheResponse(cacheKey, {
      ...user.toObject(),
      full_name: user.getFullName(),
    });

    res.status(200).json(user);
  } catch (err) {
    next(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default getUserData;
