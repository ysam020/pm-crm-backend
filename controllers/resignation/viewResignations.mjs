import ResignationModel from "../../model/resignationModel.mjs";

const viewResignations = async (req, res) => {
  try {
    const data = await ResignationModel.find({});

    const structuredData = data.map((item) => {
      const jobSatisfaction =
        (item.overall_job_satisfaction +
          item.clarity_of_job_duties +
          item.opportunity_to_utilize_skills +
          item.workload_and_stress_management +
          item.resources_and_tools_provided) /
        5;

      const trainingAndDevelopment =
        (item.opportunities_for_professional_development +
          item.effectiveness_of_training_programs_provided +
          item.support_for_continuing_education) /
        3;

      return {
        _id: item._id,
        username: item.username,
        reason: item.reason,
        job_satisfaction: jobSatisfaction,
        support_from_manager: item.support_from_manager,
        overall_company_culture: item.overall_company_culture,
        training_and_development: trainingAndDevelopment,
        suggestions: item.suggestions,
      };
    });

    res.status(200).json(structuredData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
};

export default viewResignations;
