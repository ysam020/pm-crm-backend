import UserModel from "../../model/userModel.mjs";
import { cacheResponse, getCachedData } from "../../utils/cacheResponse.mjs";

const viewTrainings = async (req, res) => {
  try {
    const { username } = req.params;
    const cacheKey = `trainings:${username}`;

    // Check if the trainings data is cached
    const cachedTrainings = await getCachedData(cacheKey);
    if (cachedTrainings) {
      return res.status(200).send(cachedTrainings);
    }

    // If not cached, fetch from the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Cache the user's trainings data
    await cacheResponse(cacheKey, user.trainings);

    res.status(200).send(user.trainings);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default viewTrainings;
