import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewWarningMemos = async (req, res) => {
  try {
    const { username } = req.params;
    const cacheKey = `warningMemos:${username}`;

    // Check if the warning memos data is cached
    const cachedWarningMemos = await getCachedData(cacheKey);
    if (cachedWarningMemos) {
      return res.status(200).send(cachedWarningMemos);
    }

    // If not cached, fetch from the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the data for subsequent requests
    await cacheResponse(cacheKey, user.warningMemos);

    // Send the response after caching
    res.status(200).send(user.warningMemos);
  } catch (error) {
    console.error("Error fetching warning memos:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewWarningMemos;
