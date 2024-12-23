import hrActivityModel from "../../model/hrActivityModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const getHrActivities = async (req, res) => {
  try {
    // Get today's date in yyyy-mm-dd format
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = "hrActivities";

    // Check if data is already cached for today
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).send(cachedData);
    }

    // If not cached, fetch data from the database
    const data = await hrActivityModel.find({ date: { $gte: today } });

    // Cache the fetched data
    await cacheResponse(cacheKey, data);

    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching HR activities:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default getHrActivities;
