import { verifyAttestationResponse } from "../../utils/verifyAttestationResponse.mjs";
import jwt from "jsonwebtoken";

const verifyRegistration = async (req, res) => {
  try {
    const token = res.locals.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const { credential } = req.body;
    const data = await verifyAttestationResponse(username, credential);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error verifying attestation response:", error);
    res.status(500).json({ message: "Failed to verify attestation response" });
  }
};

export default verifyRegistration;
