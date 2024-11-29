import express from "express";
import hrActivityModel from "../../../model/hrActivityModel.mjs";

const router = express.Router();

router.get("/api/get-hr-activities", async (req, res) => {
  try {
    const data = await hrActivityModel.find({});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
