import mongoose from "mongoose";

const Schema = mongoose.Schema;

const stickyNotesSchema = new Schema({
  username: { type: String },
  note: { type: String },
});

const StickyNotesModel = mongoose.model("StickyNotes", stickyNotesSchema);
export default StickyNotesModel;
