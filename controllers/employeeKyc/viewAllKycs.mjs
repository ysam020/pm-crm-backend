import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewAllKycs = async (req, res, next) => {
  try {
    const cacheKey = "kyc_records";
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return res.send(cachedData);
    }

    const users = await UserModel.find(
      {},
      "first_name middle_name last_name username email kyc_approval"
    );

    const reversedUsers = users.reverse();
    await cacheResponse(cacheKey, reversedUsers);

    res.send(reversedUsers);
  } catch (error) {
    next(error);
    res.status(500).send({
      message:
        "An error occurred while fetching KYC records. Please try again later.",
    });
  }
};

export default viewAllKycs;
