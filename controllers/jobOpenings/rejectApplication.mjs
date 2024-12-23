import JobApplicationModel from "../../model/jobApplicationModel.mjs";

const rejectApplication = async (req, res) => {
  try {
    const { aadharNo, jobTitle } = req.body;
    const job = await JobApplicationModel.findOne({
      aadharNo,
      jobTitle,
    });
    if (!job) {
      return res.status(404).json({ message: "Application not found" });
    }
    job.status = "Rejected";
    await job.save();

    res.status(200).json({ message: "Application rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default rejectApplication;
