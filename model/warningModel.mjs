import mongoose from "mongoose";

const Schema = mongoose.Schema;

const warning = new Schema({
  subject: {
    type: String,
  },
  description: {
    type: String,
  },
});

const WarningSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  warningMemos: [warning],
});

const WarningModel = mongoose.model("Warning", WarningSchema);
export default WarningModel;
