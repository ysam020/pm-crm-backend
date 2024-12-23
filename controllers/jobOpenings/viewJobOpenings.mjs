import JobOpeningsModel from "../../model/jobOpeneningModel.mjs";

const viewJobOpenings = async (req, res) => {
  try {
    const jobs = await JobOpeningsModel.find({});

    if (!jobs) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default viewJobOpenings;
