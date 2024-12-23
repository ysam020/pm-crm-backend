import ResignationModel from "../../model/resignationModel.mjs";
import addNotification from "../../utils/addNotification.mjs";
import sendDepartmentPushNotifications from "../../utils/sendDepartmentPushNotifications.mjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const addResignation = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const _id = new mongoose.Types.ObjectId();
    // Create a new instance of the model
    const resignation = new ResignationModel();

    // Assign all properties from req.body to the model instance
    Object.assign(resignation, { ...req.body, username, _id });

    // Save the instance to the database
    await resignation.save();

    addNotification(
      decoded.department,
      "Resignation",
      `${username} has applied for resignation`,
      decoded.rank,
      _id
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
      decoded.username,
      decoded.department,
      decoded.rank,
      payload
    );

    // Send success response
    res.status(201).json({
      message: "Form submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while submitting the form" });
  }
};

export default addResignation;
