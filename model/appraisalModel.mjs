import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appraisal = new Schema({
  appraisalDate: { type: String },
  performanceScore: { type: Number },
  strengths: { type: String },
  areasOfImprovement: { type: String },
  feedback: { type: String },
});

const AppraisalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  appraisals: [appraisal],
});

const AppraisalModel = mongoose.model("Appraisal", AppraisalSchema);
export default AppraisalModel;
