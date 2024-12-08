import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  department: { type: String },
  notifications: [
    {
      title: { type: String },
      message: { type: String },
      timeStamp: { type: Date },
      deleted: { type: Boolean, default: false },
      rank: { type: Number },
    },
  ],
});

const NotificationModel = mongoose.model("Notification", notificationSchema);
export default NotificationModel;
