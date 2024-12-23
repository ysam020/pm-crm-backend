import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewAppraisals = async (req, res) => {
  try {
    const { username } = req.params;
    const cacheKey = `appraisals:${username}`;

    // Check if the appraisals data is cached
    const cachedAppraisals = await getCachedData(cacheKey);
    if (cachedAppraisals) {
      return res.status(200).send(cachedAppraisals);
    }

    // If not cached, fetch from the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the data for the next request
    await cacheResponse(cacheKey, user.appraisals);

    // Send the response after caching
    res.status(200).send(user.appraisals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewAppraisals;
