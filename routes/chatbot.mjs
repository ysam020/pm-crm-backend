import express from "express";
import manager from "../utils/loadModel.mjs";
import verifySession from "../middlewares/verifySession.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/chatbot", verifySession, async (req, res) => {
  const token = res.locals.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const username = decoded.username;
  const rank = decoded.rank;
  const { message } = req.body;

  try {
    // Process the message through the NLP model
    const response = await manager.process("en", message);
    console.log(response);
    // Check if the intent involves user data and rank restriction applies
    if (response.intent.includes("user")) {
      const requestedUsername = response.intent.split(".")[2]; // Extract the username from the intent

      // If the intent involves another user's data and the rank is greater than 2, restrict access
      if (requestedUsername && requestedUsername !== username && rank > 2) {
        return res.json({
          intent: response.intent,
          answer: `I cannot provide you ${requestedUsername}'s data.`,
        });
      }
    }

    // Send NLP response for valid requests
    res.json({
      intent: response.intent,
      answer: response.answer || "I'm sorry, I didn’t understand that.",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
