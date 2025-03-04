import mongoose from "mongoose";

const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
  name: { type: String, uppercase: true },
  mobile: { type: String },
  email: { type: String, lowercase: true },
  aadharNo: { type: String },
  jobTitle: { type: mongoose.Schema.Types.ObjectId, ref: "JobOpening" },
  resume: { type: String },
  interviewDate: { type: String },
  reason: { type: String },
  status: {
    type: String,
  },
  score: {
    type: Number,
    min: [0, "Score must be between 0 and 1"],
    max: [1, "Score must be between 0 and 1"],
  },
});

const JobApplicationModel = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
export default JobApplicationModel;
