import mongoose from "mongoose";

const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
  name: { type: String },
  mobile: { type: String },
  email: { type: String },
  aadharNo: { type: String },
  jobTitle: { type: String },
  interviewDate: { type: String },
  status: {
    type: String,
  },
});

const JobApplicationModel = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
export default JobApplicationModel;
