import ResignationModel from "../../model/resignationModel.mjs";

const viewResignations = async (req, res, next) => {
  try {
    const data = await ResignationModel.find({});

    const structuredData = data.map((item) => {
      const jobSatisfaction = item.overall_job_satisfaction;

      return {
        _id: item._id,
        username: item.username,
        reason: item.reason,
        job_satisfaction: jobSatisfaction,
        support_from_manager: item.support_from_manager,
        overall_company_culture: item.overall_company_culture,
        suggestions: item.suggestions,
      };
    });

    res.status(200).json(structuredData);
  } catch (err) {
    next(err);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

export default viewResignations;
