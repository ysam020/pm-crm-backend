import NotificationModel from "../model/notificationModel.mjs";

const addNotification = async (department, title, message, rank, leaveId) => {
  const notificationEntry = {
    _id: leaveId,
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
};

export default addNotification;
