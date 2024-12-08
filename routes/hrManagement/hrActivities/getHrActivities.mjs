import express from "express";
import hrActivityModel from "../../../model/hrActivityModel.mjs";
import verifySession from "../../../middlewares/verifySession.mjs";

const router = express.Router();

router.get("/api/get-hr-activities", verifySession, async (req, res) => {
  try {
    // Get today's date in yyyy-mm-dd format
    const today = new Date().toISOString().split("T")[0];

    // Fetch data with date >= today
    const data = await hrActivityModel.find({ date: { $gte: today } });

    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
