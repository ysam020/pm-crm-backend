import express from "express";
import UserModel from "../../model/userModel.mjs";

const router = express.Router();

router.post("/api/get-credentials", async (req, res) => {
  const { username } = req.body;

  const user = await UserModel.findOne({ username });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const credentials = user.webAuthnCredentials.map(
    (credential) => credential.credentialID
  );

  res.send(credentials);
});

export default router;
