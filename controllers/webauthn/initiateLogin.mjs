import { generateAssertionOptions } from "../../utils/generateAssertionOptions.mjs";

const initiateLogin = async (req, res) => {
  try {
    const { username } = req.body;
    // Generate assertion options for WebAuthn login
    const options = await generateAssertionOptions(username);

    res.status(200).json(options);
  } catch (error) {
    console.error("Error generating assertion options:", error);
    res.status(500).json({ message: "Failed to generate assertion options" });
  }
};

export default initiateLogin;
