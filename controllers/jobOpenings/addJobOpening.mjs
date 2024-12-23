import JobOpeningModel from "../../model/jobOpeneningModel.mjs";

const addJobOpening = async (req, res) => {
  try {
    // Check for an existing job with the same title and an unexpired application deadline
    const existingJob = await JobOpeningModel.findOne({
      jobTitle: req.body.jobTitle,
      applicationDeadline: { $gte: new Date() },
    });

    if (existingJob) {
      return res.status(409).json({
        message: "A job with the same title is active.",
      });
    }

    // Create a new job opening instance
    const newJobOpening = new JobOpeningModel({
      jobTitle: req.body.jobTitle,
      numberOfVacancies: req.body.numberOfVacancies,
      jobPostingDate: req.body.jobPostingDate,
      applicationDeadline: req.body.applicationDeadline,
      jobDescription: req.body.jobDescription,
      requiredSkills: req.body.requiredSkills,
      experience: req.body.experience,
      location: req.body.location,
      budget: req.body.budget,
      hiringManager: req.body.hiringManager,
    });

    // Save the job opening to the database
    await newJobOpening.save();

    // Send a success response
    res.status(201).json({
      message: "Job opening created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "Error creating job opening:", error });
  }
};

export default addJobOpening;
