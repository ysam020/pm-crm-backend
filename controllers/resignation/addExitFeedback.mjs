import ResignationModel from "../../model/resignationModel.mjs";

const addExitFeedback = async (req, res, next) => {
  try {
    const username = req.user.username;

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
    next(err);
    res.status(500).json({
      message: "An error occurred while submitting the feedback.",
    });
  }
};

export default addExitFeedback;
