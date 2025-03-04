import NotificationModel from "../../model/notificationModel.mjs";

const getNotifications = async (req, res, next) => {
  try {
    const department = req.user.department;
    const rank = req.user.rank;

    // Fetch all notifications with the desired conditions using aggregation
    const userNotifications = await NotificationModel.aggregate([
      {
        $match: { department },
      },
      {
        $project: {
          notifications: {
            $filter: {
              input: "$notifications",
              as: "notification",
              cond: {
                $and: [
                  { $eq: ["$$notification.deleted", false] },
                  { $gte: ["$$notification.rank", rank] },
                ],
              },
            },
          },
        },
      },
      {
        // Reverse the array to show the last item at the top
        $project: {
          notifications: { $reverseArray: "$notifications" },
        },
      },
    ]);

    if (
      !userNotifications ||
      userNotifications.length === 0 ||
      userNotifications[0].notifications.length === 0
    ) {
      return res
        .status(200)
        .send({ message: "No notifications found for the user" });
    }

    res.status(200).send(userNotifications[0].notifications);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
};

export default getNotifications;
