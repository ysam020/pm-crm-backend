import mongoose from "mongoose";
import JobApplicationModel from "../../model/jobApplicationModel.mjs";
import JobOpeningModel from "../../model/jobOpeneningModel.mjs";
import UserModel from "../../model/userModel.mjs";
import { sendOfferLetter } from "../../utils/sendOfferLetter.mjs";

const generateUniqueUsername = async (baseUsername, session) => {
  let uniqueUsername = baseUsername;
  let counter = 1;

  while (
    await UserModel.findOne({ username: uniqueUsername }).session(session)
  ) {
    uniqueUsername = `${baseUsername}_${counter}`;
    counter++;
  }

  return uniqueUsername;
};

const hireCandidate = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { aadharNo, email, jobTitle, salary, joining_date, reference_by } =
      req.body;

    // Find the job application
    const job = await JobApplicationModel.findOne({
      aadharNo,
      jobTitle,
    }).session(session);
    if (!job) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Application not found" });
    }

    if (job.status === "Hired") {
      await session.abortTransaction();
      return res.status(409).json({ message: "Candidate already hired" });
    }

    // Update the job application status
    job.status = "Hired";
    await job.save({ session });

    // Update the job opening with the incremented hired count
    const existingJob = await JobOpeningModel.findOne({
      jobTitle: jobTitle,
      applicationDeadline: { $gte: new Date() },
    }).session(session);

    if (!existingJob) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Job opening not found" });
    }

    if (existingJob.candidatesHired >= existingJob.numberOfVacancies) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "All vacancies have been filled for this job",
      });
    }

    existingJob.candidatesHired += 1;
    await existingJob.save({ session });

    // Add new user to the UserModel
    const nameParts = job.name.split(" ");
    let first_name,
      middle_name = null,
      last_name = null;

    if (nameParts.length === 1) {
      first_name = nameParts[0];
      last_name = "";
    } else if (nameParts.length === 2) {
      [first_name, last_name] = nameParts;
    } else if (nameParts.length > 2) {
      first_name = nameParts[0];
      last_name = nameParts[nameParts.length - 1];
      middle_name = nameParts.slice(1, -1).join(" ");
    } else {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid name format" });
    }

    const baseUsername = last_name ? `${first_name}_${last_name}` : first_name;
    const username = await generateUniqueUsername(baseUsername, session);

    const password = process.env.DEFAULT_PASSWORD;

    const rankMapping = {
      MD: 1,
      PROPRIETOR: 1,
      "CENTER HEAD": 1,
      HOD: 1,
      "BACK OFFICE MANAGER": 2,
      "OPERATION MANAGER": 2,
      MANAGER: 2,
      AM: 2,
      "HR MANAGER": 2,
      "HR ADMIN": 2,
      "HR-BACK OFFICE EXECUTIVE": 3,
      "BACK OFFICE EXECUTIVE": 3,
      "HR EXECUTIVE": 3,
      "HR & BACKEND": 3,
      "FIELD EXECUTIVE": 3,
      "TEAM LEADER": 3,
      ATL: 3,
      "MIS EXECUTIVE": 3,
      "Q.A.": 3,
      TRAINER: 3,
      TELECALLER: 4,
      "HOUSE KEEPING": 4,
      GUARD: 4,
    };

    const rank = rankMapping[jobTitle.toUpperCase()] || 4;

    const newUser = new UserModel({
      first_name: first_name,
      middle_name: middle_name ? middle_name : "",
      last_name: last_name ? last_name : "",
      designation: jobTitle,
      salary,
      joining_date,
      reference_by,
      username,
      password,
      rank,
    });

    await newUser.save({ session });

    await sendOfferLetter(job.name, email, jobTitle, salary, joining_date);
    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({ message: "Hired successfully and user created" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
    res.status(500).json({ message: "Something went wrong" });
  } finally {
    session.endSession();
  }
};

export default hireCandidate;
