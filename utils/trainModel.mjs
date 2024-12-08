import { NlpManager } from "node-nlp";
import UserModel from "../model/userModel.mjs";
import JobOpeningModel from "../model/jobOpeneningModel.mjs";
import {
  dynamicTemplates,
  generateJobIntents,
  staticTemplates,
} from "./queryTemplates.mjs";

const manager = new NlpManager({ languages: ["en"], forceNER: true });

const staticIntents = staticTemplates.map((template) => ({
  query: template.query,
  intent: template.query.replace(/[^a-zA-Z]/g, "_").toLowerCase(),
  response:
    template.responses[Math.floor(Math.random() * template.responses.length)],
}));

const dynamicIntents = (users) => {
  return users.flatMap((user) =>
    Object.entries(dynamicTemplates).flatMap(([field, templates]) =>
      templates.map(({ query, response }) => {
        let formattedResponse;

        // Special handling for permanent_address
        if (field === "permanent_address") {
          const fullAddress = [
            user.permanent_address_line_1,
            user.permanent_address_line_2,
            user.permanent_address_city,
            user.permanent_address_state,
            user.permanent_address_pincode,
          ]
            .filter((part) => part) // Remove empty fields
            .join(", ");

          formattedResponse = fullAddress
            ? response
                .replace("{username}", user.username.replace("_", " "))
                .replace("{value}", fullAddress)
            : `Sorry, permanent address of ${user.username.replace(
                "_",
                " "
              )} is not available.`;
        } else if (field === "communication_address") {
          const fullAddress = [
            user.communication_address_line_1,
            user.communication_address_line_2,
            user.communication_address_city,
            user.communication_address_state,
            user.communication_address_pincode,
          ]
            .filter((part) => part) // Remove empty fields
            .join(", ");

          formattedResponse = fullAddress
            ? response
                .replace("{username}", user.username.replace("_", " "))
                .replace("{value}", fullAddress)
            : `Sorry, communication address of ${user.username.replace(
                "_",
                " "
              )} is not available.`;
        } else {
          // Generic response formatting for other fields
          const fieldValue = user[field];
          formattedResponse = fieldValue
            ? response
                .replace("{username}", user.username.replace("_", " "))
                .replace("{value}", fieldValue)
            : `Sorry, ${field.replace("_", " ")} of ${user.username.replace(
                "_",
                " "
              )} is not available.`;
        }

        return {
          query: query.replace("{username}", user.username),
          intent: `user.${field}.${user.username}`,
          response: formattedResponse,
        };
      })
    )
  );
};

// Train model dynamically
const trainWithData = async () => {
  try {
    // Add static intents
    staticIntents.forEach(({ query, intent, response }) => {
      manager.addDocument("en", query, intent);
      manager.addAnswer("en", intent, response);
    });

    // Fetch all users from the database
    const users = await UserModel.find();

    // Add dynamic intents for users and fields
    const userIntents = dynamicIntents(users);
    userIntents.forEach((intent) => {
      manager.addDocument("en", intent.query, intent.intent);
      manager.addAnswer("en", intent.intent, intent.response);
    });

    const jobOpenings = await JobOpeningModel.find();

    // Add dynamic intents for each job opening
    jobOpenings.forEach((job) => {
      const jobIntents = generateJobIntents(job);
      jobIntents.forEach((intent) => {
        manager.addDocument("en", intent.query, intent.intent);
        intent.rephrases.forEach((rephrase) => {
          manager.addDocument("en", rephrase, intent.intent);
        });
        manager.addAnswer("en", intent.intent, intent.response);
      });
    });

    // Train and save the model
    await manager.train();
    manager.save();
    console.log("Model trained successfully.");
  } catch (err) {
    console.error("Error training NLP model:", err);
  }
};

trainWithData();

export default manager;
