import express from "express";
import UserModel from "../../model/userModel.mjs";
import admin from "../../utils/firebaseAdmin.mjs";
import verifySession from "../../middlewares/verifySession.mjs";

const router = express.Router();

router.post("/api/assign-modules", verifySession, async (req, res) => {
  try {
    const { modules, username } = req.body;
    const firestore = admin.firestore();

    // Reference to the user's document
    const userDocRef = firestore.collection("modules").doc(username);

    // Reference to the 'moduleName' subcollection
    const moduleRef = userDocRef.collection("moduleName");

    // Ensure the modules array is valid
    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).send({ message: "No modules to assign" });
    }

    // Use Promise.all to ensure all modules are added
    await Promise.all(
      modules.map(async (moduleName) => {
        if (!moduleName) {
          console.error("Module name is invalid:", moduleName);
          return;
        }

        // Create a document reference for each module inside the moduleName subcollection
        const moduleDocRef = moduleRef.doc(moduleName);

        // Set the module document with any relevant data
        await moduleDocRef.set({
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          // You can add additional fields as necessary
        });
      })
    );

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(200).send({ message: "User not found" });
    }

    // Update user modules with unique values
    user.modules = [...new Set([...user.modules, ...modules])];

    await user.save();

    // Ensure the user has FCM tokens
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(200).send({ message: "User has no FCM tokens" });
    }

    // Prepare the payload
    const payload = {
      notification: {
        title: `Notification from ${username}`,
        body: `Module assigned: ${modules.join(", ")}`,
        image:
          "https://paymaster-document.s3.ap-south-1.amazonaws.com/favicon.png",
      },
      data: {
        LinkUrl: "http://localhost:3000",
      },
    };

    //  Send notifications to each token
    const responses = await Promise.all(
      user.fcmTokens.map(async (token) => {
        try {
          return await admin.messaging().send({ ...payload, token });
        } catch (error) {
          console.error("Error sending notification to token:", token, error);
          return { error }; // Return error for this token
        }
      })
    );

    // Optionally handle responses and log success/errors
    const failedTokens = responses.filter((resp) => resp.error);
    if (failedTokens.length > 0) {
      console.log("Failed to send notifications for tokens:", failedTokens);
    }
    res.send({ message: "Notification sent successfully", responses });
  } catch (error) {
    console.error("Error assigning modules:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
