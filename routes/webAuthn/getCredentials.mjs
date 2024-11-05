import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/get-credentials", async (req, res) => {
  try {
    const { username } = req.body;
    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Map the webAuthnCredentials to extract credential IDs
    const credentials = user.webAuthnCredentials.map(
      (credential) => credential.credentialID
    );

    res.send(credentials);
  } catch (error) {
    console.error("Error fetching credentials:", error); // Log the error for debugging
    res.status(500).send({
      message:
        "An error occurred while fetching credentials. Please try again later.",
    }); // Send a user-friendly error message
  }
});

export default router;
