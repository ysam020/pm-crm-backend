import NotificationModel from "../model/notificationModel.mjs";

const addNotification = async (io, department, title, message, rank) => {
  const notificationEntry = {
    title: title,
    message: message,
    timeStamp: new Date(),
    rank: rank,
  };

  await NotificationModel.updateOne(
    { department: department },
    {
      $push: { notifications: notificationEntry },
    },
    { upsert: true }
  );

  io.emit("notification", {
    department,
    rank,
    notificationEntry,
    title,
    message,
  });
};

export default addNotification;
