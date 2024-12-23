import { generateAttestationOptions } from "../../utils/generateAttestationOptions.mjs";
import UserModel from "../../model/userModel.mjs";
import jwt from "jsonwebtoken";

const initiateRegistration = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const user = await UserModel.findOne({ username });

    await user.save();
    const options = await generateAttestationOptions(username);
    res.status(200).json(options);
  } catch (error) {
    console.error("Error generating attestation options:", error);
    res.status(500).json({ message: "Failed to generate attestation options" });
  }
};

export default initiateRegistration;
