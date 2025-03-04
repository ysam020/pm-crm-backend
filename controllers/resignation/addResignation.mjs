import ResignationModel from "../../model/resignationModel.mjs";
import UserModel from "../../model/userModel.mjs";
import addNotification from "../../utils/addNotification.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import mongoose from "mongoose";

const addResignation = async (req, res, next) => {
  try {
    const username = req.user.username;
    const _id = new mongoose.Types.ObjectId();

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notice_period = user.rank === 4 ? 30 : 60;

    const resignation_date = new Date();
    const resignation_date_str = resignation_date.toISOString().split("T")[0];
    resignation_date.setDate(resignation_date.getDate() + notice_period);
    const last_date = resignation_date.toISOString().split("T")[0]; // Format the last date

    // Prepare the document data for insert
    const resignationData = {
      ...req.body,
      username,
      notice_period,
      last_date,
      resignation_date: resignation_date_str,
    };

    // Find a document by username and update it, or insert a new one
    await ResignationModel.findOneAndUpdate(
      { username },
      {
        $set: { ...resignationData }, // Set fields (excluding _id)
        $setOnInsert: { _id }, // Assign _id only on insert
      },
      { upsert: true, new: true } // Create if not exists, return the updated/new document
    );

    const io = req.app.get("io");

    // Add a notification
    addNotification(
      io,
      req.user.department,
      "Resignation",
      `${username} has applied for resignation`,
      req.user.rank
    );

    const payload = {
      notification: {
        title: `Resignation`,
        body: `${username} has applied for resignation`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendDepartmentPushNotifications(
      req.user.username,
      req.user.department,
      req.user.rank,
      payload
    );

    // Send success response
    res.status(201).json({
      message: "Form submitted successfully",
    });
  } catch (err) {
    next(err);
    res
      .status(500)
      .json({ message: "An error occurred while submitting the form" });
  }
};

export default addResignation;
