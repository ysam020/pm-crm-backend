import mongoose from "mongoose";

const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
  name: { type: String, uppercase: true },
  mobile: { type: String },
  email: { type: String, lowercase: true },
  aadharNo: { type: String },
  jobTitle: { type: String, uppercase: true },
  resume: { type: String },
  interviewDate: { type: String },
  reason: { type: String },
  status: {
    type: String,
  },
});

const JobApplicationModel = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
export default JobApplicationModel;
