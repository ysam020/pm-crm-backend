import mongoose from "mongoose";

const ResignationSchema = new mongoose.Schema({
  username: { type: String },
  resignation_date: { type: String },
  notice_period: { type: Number },
  last_date: { type: String },
  reason: { type: String },
  overall_job_satisfaction: { type: Number, default: 0 },
  clarity_of_job_duties: { type: Number, default: 0 },
  opportunity_to_utilize_skills: { type: Number, default: 0 },
  workload_and_stress_management: { type: Number, default: 0 },
  resources_and_tools_provided: { type: Number, default: 0 },
  quality_of_communication: { type: String },
  support_from_manager: { type: String },
  appreciation_for_work: { type: String },
  collaboration_within_the_team: { type: String },
  overall_company_culture: { type: String },
  opportunities_for_professional_development: { type: Number, default: 0 },
  effectiveness_of_training_programs_provided: { type: Number, default: 0 },
  support_for_continuing_education: { type: Number, default: 0 },
  suggestions: { type: String },
});

const ResignationModel = new mongoose.model("Resignation", ResignationSchema);
export default ResignationModel;
