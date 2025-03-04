// import NotificationModel from "../model/notificationModel.mjs";

// const addNotification = async (
//   io,
//   department,
//   title,
//   message,
//   rank,
//   recordId
// ) => {
//   const notificationEntry = {
//     _id: recordId,
//     title: title,
//     message: message,
//     timeStamp: new Date(),
//     rank: rank,
//   };

//   await NotificationModel.updateOne(
//     { department: department },
//     {
//       $push: { notifications: notificationEntry },
//     },
//     { upsert: true }
//   );

//   io.emit("notification", {
//     department,
//     rank,
//     notificationEntry,
//     title,
//     message,
//   });
// };

// export default addNotification;

import NotificationModel from "../model/notificationModel.mjs";
import mongoose from "mongoose";

const addNotification = async (
  io,
  department,
  title,
  message,
  rank,
  recordId
) => {
  const notificationEntry = {
    _id: recordId || new mongoose.Types.ObjectId(),
    title: title,
    message: message,
    timeStamp: new Date(),
    rank: rank,
  };

  if (recordId) {
    const existingNotification = await NotificationModel.findOne({
      department: department,
      "notifications._id": recordId,
    });

    if (existingNotification) {
      // Update if notification exists
      await NotificationModel.updateOne(
        {
          department: department,
          "notifications._id": recordId,
        },
        {
          $set: {
            "notifications.$": notificationEntry,
          },
        }
      );
    } else {
      // Create new if notification doesn't exist
      await NotificationModel.updateOne(
        { department: department },
        {
          $push: { notifications: notificationEntry },
        },
        { upsert: true }
      );
    }
  } else {
    // Create new notification if no recordId provided
    await NotificationModel.updateOne(
      { department: department },
      {
        $push: { notifications: notificationEntry },
      },
      { upsert: true }
    );
  }

  io.emit("notification", {
    department,
    rank,
    notificationEntry,
    title,
    message,
  });

  return notificationEntry._id;
};

export default addNotification;
