import ResumeParser from "simple-resume-parser";
import dotenv from "dotenv";
import Fuse from "fuse.js";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);

async function extractResumeDetails(text) {
  try {
    const prompt = `
      Extract the following details from the resume:
      1. List of technical skills (as an array).
      2. Total years of experience in decimals.

      Resume Content:
      ${text}

      Response format:
      {"skills": ["skill1", "skill2"], "experience": X}

      Return ONLY valid JSON without additional text or explanations.
    `;

    const output = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    let responseContent = output.choices[0].message.content.trim();

    let jsonStart = responseContent.indexOf("{");
    let jsonEnd = responseContent.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(responseContent.substring(jsonStart, jsonEnd + 1));
    }
  } catch (error) {
    console.error("Error in Hugging Face API:", error);
  }
  return { skills: [], experience: 0 };
}

function fuzzyMatch(skill, requiredSkills) {
  const fuse = new Fuse(requiredSkills, { threshold: 0.4, includeScore: true });
  const result = fuse.search(skill);
  return result.length > 0 ? 1 - result[0].score : 0;
}

function scoreCandidate(
  candidateSkills,
  candidateExperience,
  requiredSkills,
  requiredExperience
) {
  const expRatio = Math.min(candidateExperience / requiredExperience, 1.0);
  let totalSkillScore = candidateSkills.reduce(
    (acc, skill) => acc + fuzzyMatch(skill, requiredSkills),
    0
  );
  const skillsRatio =
    requiredSkills.length > 0 ? totalSkillScore / requiredSkills.length : 0;
  return ((expRatio + skillsRatio) / 2).toFixed(2);
}

async function processResume(filePath, requiredExperience, requiredSkills) {
  try {
    const resume = new ResumeParser(filePath);
    const data = await resume.parseToJSON();
    const resumeText = data.text || JSON.stringify(data);
    const { skills, experience } = await extractResumeDetails(resumeText);

    const score = scoreCandidate(
      skills,
      experience,
      requiredSkills,
      requiredExperience
    );

    return score;
  } catch (error) {
    console.error("Error processing resume:", error);
  }
}

export default processResume;
