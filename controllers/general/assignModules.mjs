import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";
import sendPushNotifications from "../../utils/sendPushNotifications.mjs";

const assignModules = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const assignee = decoded.username;
    const { modules, username } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user modules with unique values
    user.modules = [...new Set([...user.modules, ...modules])];

    await user.save();

    const io = req.app.get("io");
    io.emit("modulesAssigned", { username: user.username, modules });

    // Ensure the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(200).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Notification from ${assignee}`,
        body: `Module assigned: ${modules.join(", ")}`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/kyc/personal.webp/favicon.png",
      },
    };

    await sendPushNotifications(user, payload);

    res.status(200).send({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error assigning modules:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default assignModules;
