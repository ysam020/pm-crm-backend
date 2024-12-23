import User from "../../model/userModel.mjs";

const credentialCheck = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username }).select(
      "webAuthnCredentials isTwoFactorEnabled"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isTwoFactorEnabled = user.isTwoFactorEnabled;

    if (!user.webAuthnCredentials || user.webAuthnCredentials.length === 0) {
      return res
        .status(200)
        .json({ hasCredentials: false, isTwoFactorEnabled });
    }

    // User has credentials
    res.status(200).json({ hasCredentials: true, isTwoFactorEnabled });
  } catch (error) {
    console.error("Error checking credentials:", error);
    res.status(500).json({ error: "Failed to check credentials" });
  }
};

export default credentialCheck;
