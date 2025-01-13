import ResignationModel from "../../model/resignationModel.mjs";
import jwt from "jsonwebtoken";

const addExitFeedback = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Check if a resignation form exists for the user
    const existingResignation = await ResignationModel.findOne({ username });
    if (!existingResignation) {
      return res.status(400).json({
        message: "Please fill out the resignation form first.",
      });
    }

    // Prepare the feedback data
    const feedbackData = { ...req.body, username };

    // Update the existing resignation with feedback data
    const updatedResignation = await ResignationModel.findOneAndUpdate(
      { username }, // Query to find the document
      { $set: feedbackData }, // Update fields
      { new: true } // Return the updated document
    );

    // Send success response
    res.status(201).json({
      message: "Exit feedback submitted successfully.",
      resignation: updatedResignation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while submitting the feedback.",
    });
  }
};

export default addExitFeedback;
