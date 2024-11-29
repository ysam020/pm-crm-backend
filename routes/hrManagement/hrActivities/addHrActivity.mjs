import express from "express";
import hrActivityModel from "../../../model/hrActivityModel.mjs";

const router = express.Router();

router.post("/api/add-hr-activity", async (req, res) => {
  try {
    const hrActivity = req.body;

    // Create a new record and save it to the database
    const newHrActivity = new hrActivityModel(hrActivity);
    await newHrActivity.save();

    res.status(201).send({ message: "HR activity added successfully" });
  } catch (error) {
    console.error("Error saving HR activity:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
