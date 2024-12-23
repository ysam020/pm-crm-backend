import hrActivityModel from "../../model/hrActivityModel.mjs";
import { cacheResponse } from "../../utils/cacheResponse.mjs";

const addHrActivity = async (req, res) => {
  try {
    const hrActivity = req.body;

    // Create a new record and save it to the database
    const newHrActivity = new hrActivityModel(hrActivity);
    await newHrActivity.save();

    // Fetch all HR activities from the database to get the updated list
    const allHrActivities = await hrActivityModel.find().lean();

    // Update the cache with the new list of HR activities
    const cacheKey = "hrActivities:all";
    await cacheResponse(cacheKey, allHrActivities);

    res.status(201).send({ message: "HR activity added successfully" });
  } catch (error) {
    console.error("Error saving HR activity:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default addHrActivity;
