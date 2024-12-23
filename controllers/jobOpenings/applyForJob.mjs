import JobApplicationModel from "../../model/jobApplicationModel.mjs";

const applyForJob = async (req, res) => {
  try {
    const { name, mobile, email, aadharNo, jobTitle, resume } = req.body;

    // Check if an application with the same jobTitle and any of email, mobile, or aadharNo exists
    const existingApplication = await JobApplicationModel.findOne({
      jobTitle,
      $or: [{ email }, { mobile }, { aadharNo }],
    });

    if (existingApplication) {
      return res
        .status(409)
        .json({ message: "You have already applied for this job." });
    }

    // Create a new job application if no match is found
    const newApplication = new JobApplicationModel({
      name,
      mobile,
      email,
      aadharNo,
      jobTitle,
      resume,
    });

    await newApplication.save();

    res.status(200).json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({
      message:
        "An error occurred while submitting your application. Please try again later.",
    });
  }
};

export default applyForJob;
