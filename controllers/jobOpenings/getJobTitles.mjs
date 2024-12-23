import JobOpeningModel from "../../model/jobOpeneningModel.mjs";

const getJobTitles = async (req, res) => {
  try {
    // Get the current date and time
    const currentDate = new Date();

    // Find all documents where applicationDeadline is in the future
    const jobApplications = await JobOpeningModel.find({
      applicationDeadline: { $gt: currentDate },
    });

    // Extract unique job titles using a Set
    const uniqueJobTitles = [
      ...new Set(jobApplications.map((job) => job.jobTitle)),
    ];

    res.status(200).json(uniqueJobTitles);
  } catch (error) {
    console.error("Error fetching job titles:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching job titles. Please try again later.",
    });
  }
};

export default getJobTitles;
