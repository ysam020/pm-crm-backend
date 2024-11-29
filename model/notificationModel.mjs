import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  username: { type: String, unique: true },
  department: { type: String },
  notifications: [
    {
      title: { type: String },
      message: { type: String },
      timeStamp: { type: Date },
      deleted: { type: Boolean, default: false },
    },
  ],
});

const NotificationModel = mongoose.model("Notification", notificationSchema);
export default NotificationModel;
