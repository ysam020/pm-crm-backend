import UserModel from "../../model/userModel.mjs";

const resetBlockedAccounts = async () => {
  const now = new Date();

  try {
    // Find users with `isBlocked: true` and `blockedUntil` <= current time
    const usersToUnblock = await UserModel.find({
      isBlocked: true,
      blockedUntil: { $lte: now, $exists: true },
    });

    let resetCount = 0;

    for (const user of usersToUnblock) {
      user.resetBlockStatus();
      await user.save();
      resetCount++;
    }

    return { success: true, count: resetCount };
  } catch (err) {
    console.error("Error in unblocking users: ", err);
    return { success: false, error: err.message };
  }
};

export default resetBlockedAccounts;