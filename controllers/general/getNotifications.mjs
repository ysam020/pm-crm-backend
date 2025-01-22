import NotificationModel from "../../model/notificationModel.mjs";
import jwt from "jsonwebtoken";

const getNotifications = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const department = decoded.department;
    const rank = decoded.rank;

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
    console.error("Error fetching notifications:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default getNotifications;
