import { NlpManager } from "node-nlp";
import path from "path";

// Initialize a new NlpManager instance
const manager = new NlpManager({ languages: ["en"], forceNER: true });

// Path to the saved model
const modelPath = path.join(process.cwd(), "model.nlp");

// Function to load the trained model
const loadModel = async () => {
  try {
    // Load the trained model
    await manager.load(modelPath);
    console.log("Model loaded successfully.");
  } catch (err) {
    console.error("Error loading the model:", err);
  }
};

// Call the loadModel function
loadModel();

export default manager;
