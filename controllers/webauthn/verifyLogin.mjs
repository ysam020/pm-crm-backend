import { verifyAssertionResponse } from "../../utils/verifyAssertionResponse.mjs";

const verifyLogin = async (req, res) => {
  try {
    const { username, credential } = req.body;
    // Verify assertion response during WebAuthn login
    const loginResponse = await verifyAssertionResponse(username, credential);

    res.status(200).json(loginResponse);
  } catch (error) {
    console.error("Error verifying assertion response:", error);
    res.status(500).json({ message: "Failed to verify assertion response" });
  }
};

export default verifyLogin;
