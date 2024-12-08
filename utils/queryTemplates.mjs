import JobApplicationModel from "../model/jobApplicationModel.mjs";

export const dynamicTemplates = {
  dob: [
    {
      query: "What is {username}'s date of birth?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "When is {username}'s birthday?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Could you tell me {username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Do you know {username}'s date of birth?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What is the dob of {username}?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What's {username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "When was {username} born?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Tell me the date of birth of {username}.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Can you provide {username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Provide {username}'s date of birth.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "{username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Got {username}'s birthday?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Can I know {username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "When is {username}'s b-day?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What's {username}'s b-day?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Tell me {username}'s date of birth.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Give me {username}'s dob.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Let me know {username}'s birthday.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Share {username}'s date of birth.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Show me {username}'s dob.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What is {username}'s full date of birth?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "When exactly is {username}'s date of birth?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Could you share the complete date of birth of {username}?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "{username}'s dob is when?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "{username}'s birthday falls on what date?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What date does {username} celebrate their birthday?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "The dob of {username} is?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "When does {username} celebrate their b-day?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "I need {username}'s dob, please.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Can you look up {username}'s date of birth for me?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Please confirm {username}'s dob.",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "What is the registered dob of {username}?",
      response: "{username}'s date of birth is {value}.",
    },
    {
      query: "Can you find out {username}'s dob?",
      response: "{username}'s date of birth is {value}.",
    },
  ],

  first_name: [
    {
      query: "What is the first name of {username}?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "What is first name of {username}?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "first name of {username}?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Tell me {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "What's the first name of {username}?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "What is {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Can you tell me {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Do you know {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Tell me the first name of {username}.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Could you provide {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Give me {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Let me know {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Share {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Show me {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "What is {username}'s given name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "{username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Can I know {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Do you have {username}'s first name?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "The first name of {username} is?",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "Please confirm {username}'s first name.",
      response: "{username}'s first name is {value}.",
    },
    {
      query: "What is the registered first name of {username}?",
      response: "{username}'s first name is {value}.",
    },
  ],

  last_name: [
    {
      query: "What is the last name of {username}?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "What is last name of {username}?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "last name of {username}?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Tell me {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "What's the last name of {username}?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "What is {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Can you tell me {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Do you know {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Tell me the last name of {username}.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Could you provide {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Give me {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Let me know {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Share {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Show me {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "{username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Can I know {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Do you have {username}'s last name?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "The last name of {username} is?",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "Please confirm {username}'s last name.",
      response: "{username}'s last name is {value}.",
    },
    {
      query: "What is the registered last name of {username}?",
      response: "{username}'s last name is {value}.",
    },
  ],

  department: [
    {
      query: "What is the department of {username}?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "What is department of {username}?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "department of {username}?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Tell me {username}'s department.",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Which department does {username} belong to?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "In which department does {username} work?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Can you tell me {username}'s department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Where does {username} work in terms of department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "What is the name of {username}'s department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Do you know the department of {username}?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "What is {username}'s work department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Where does {username} work? Which department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "In which dept does {username} work?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Can I know {username}'s department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "What is the dept of {username}?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "In which deptt {username} works in?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "{username}'s department?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "The department of {username} is?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Please confirm {username}'s department.",
      response: "{username}'s department is {value}.",
    },
    {
      query: "Where does {username} work in terms of dept?",
      response: "{username}'s department is {value}.",
    },
    {
      query: "What department does {username} work in?",
      response: "{username}'s department is {value}.",
    },
  ],

  designation: [
    {
      query: "What is the designation of {username}?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What is designation of {username}?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "designation of {username}?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Tell me {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What's the designation of {username}?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What is {username}'s designation?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Can you tell me {username}'s designation?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What role does {username} have?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What position does {username} hold?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What is {username}'s job title?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "In which role does {username} work?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Do you know {username}'s designation?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Could you provide {username}'s designation?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Give me {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Let me know {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Share {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Show me {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What designation does {username} hold?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "What is {username}'s professional title?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "The designation of {username} is?",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Please confirm {username}'s designation.",
      response: "{username}'s designation is {value}.",
    },
    {
      query: "Where does {username} work and at what designation?",
      response: "{username}'s designation is {value}.",
    },
  ],

  skill: [
    {
      query: "What is the skill of {username}?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What is skill of {username}?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "skill of {username}?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Tell me {username}'s skill.",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What are the skills {username} possesses?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Can you list {username}'s key skills?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What are {username}'s professional skills?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Which skills does {username} excel in?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What is {username}'s area of expertise?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What is {username}'s core competency?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What specific skill does {username} specialize in?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Can you tell me what {username} is skilled at?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What technical skill does {username} have?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What are {username}'s main skills?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Could you provide {username}'s skillset?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What type of skills does {username} bring to the table?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What is the talent or skill of {username}?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "In which skill does {username} excel?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Can you share what {username} is proficient in?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "Does {username} have any specific skills?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What does {username} specialize in terms of skills?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What is the primary skill of {username}?",
      response: "{username}'s skill is {value}.",
    },
    {
      query: "What makes {username} skilled professionally?",
      response: "{username}'s skill is {value}.",
    },
  ],

  blood_group: [
    {
      query: "What is the blood group of {username}?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What is blood group of {username}?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "blood group of {username}?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Tell me {username}'s blood group.",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What's {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Can you tell me {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What blood type does {username} have?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Do you know {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Which blood group does {username} have?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Can you provide {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What is {username}'s blood type?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "In which blood group category does {username} fall?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What is the blood type of {username}?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Can I know {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What type of blood group does {username} have?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Please confirm {username}'s blood group.",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "What blood group category does {username} belong to?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "The blood group of {username} is?",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Let me know {username}'s blood group.",
      response: "{username}'s blood group is {value}.",
    },
    {
      query: "Could you share {username}'s blood group?",
      response: "{username}'s blood group is {value}.",
    },
  ],

  permanent_address: [
    {
      query: "What is the permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What is permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Tell me {username}'s permanent address.",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What's {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Can you provide {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What address is listed as {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Do you know {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Could you share the permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What location is registered as {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Where is {username}'s permanent address located?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What is the full permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Can you confirm {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Please provide {username}'s permanent address.",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What permanent location is tied to {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "The permanent address of {username} is?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Where does {username} have their permanent residence?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What is the official permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "Could you provide the detailed permanent address of {username}?",
      response: "{username}'s permanent address is {value}.",
    },
    {
      query: "What is listed as {username}'s permanent address?",
      response: "{username}'s permanent address is {value}.",
    },
  ],

  communication_address: [
    {
      query: "What is the communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What is communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Tell me {username}'s communication address.",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What's {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Can you provide {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What address does {username} use for communication?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Do you know {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Could you share the communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query:
        "Where can {username} be reached through their communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What is the registered communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What location is listed as {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What is the full communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Can you confirm {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Please provide {username}'s communication address.",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Where does {username} prefer to receive communication?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "The communication address of {username} is?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "Where is {username}'s communication address located?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What is the official communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query:
        "Could you provide the detailed communication address of {username}?",
      response: "{username}'s communication address is {value}.",
    },
    {
      query: "What is listed as {username}'s communication address?",
      response: "{username}'s communication address is {value}.",
    },
  ],

  qualification: [
    {
      query: "What is the qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "Tell me {username}'s qualification.",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What's the educational qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "Can you tell me about {username}'s qualification?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What degree does {username} have?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is the highest qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What academic qualification does {username} hold?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is {username}'s educational background?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What qualifications does {username} possess?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "Can you provide the details of {username}'s qualification?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What academic degrees does {username} have?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "In which field is {username} qualified?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "Can you confirm {username}'s qualification?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "Please tell me about {username}'s qualifications.",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is {username}'s professional qualification?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is the full qualification of {username}?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What is {username}'s degree qualification?",
      response: "{username}'s qualification is {value}.",
    },
    {
      query: "What are the educational qualifications of {username}?",
      response: "{username}'s qualification is {value}.",
    },
  ],

  joining_date: [
    {
      query: "What is the joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What is joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Tell me {username}'s joining date.",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "When did {username} join the company?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Can you provide the joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What is the date when {username} started working?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Do you know the joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "When was {username} hired?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What is {username}'s employment start date?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Can you tell me the joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "When did {username} first join the organization?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Please share the joining date of {username}.",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "When was the joining date of {username} recorded?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What is the official joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What date did {username} start their job?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Can you confirm {username}'s joining date?",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "Please provide the joining date for {username}.",
      response: "{username}'s joining date is {value}.",
    },
    {
      query: "What is the exact joining date of {username}?",
      response: "{username}'s joining date is {value}.",
    },
  ],

  mobile: [
    {
      query: "What is the mobile of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is mobile of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "mobile of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Tell me {username}'s mobile.",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is {username}'s phone number?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Can you provide {username}'s mobile number?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is the contact number of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What phone number does {username} use?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Do you know {username}'s mobile number?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Can you share the mobile number of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is the phone number associated with {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Can you tell me the mobile number of {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Please provide the mobile number for {username}.",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is the mobile contact for {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Could you confirm {username}'s mobile number?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What number is {username}'s mobile?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "What is the contact mobile for {username}?",
      response: "{username}'s mobile is {value}.",
    },
    {
      query: "Can you confirm the phone number for {username}?",
      response: "{username}'s mobile is {value}.",
    },
  ],

  email: [
    {
      query: "What is the email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Tell me {username}'s email.",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is {username}'s email address?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Can you provide {username}'s email?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the contact email for {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the official email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the email address of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Do you know {username}'s email address?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Can you share {username}'s email?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the personal email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Can you tell me {username}'s email address?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Please provide {username}'s email.",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the business email of {username}?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "Can you confirm {username}'s email address?",
      response: "{username}'s email is {value}.",
    },
    {
      query: "What is the email ID of {username}?",
      response: "{username}'s email is {value}.",
    },
  ],
};

export const generateJobIntents = (job) => [
  {
    query: `how many candidates have been hired for {jobTitle}`,
    intent: `job.${job.jobTitle}.candidates_hired`,
    response: `${job.candidatesHired} candidates have been hired for the ${job.jobTitle} position.`,
    rephrases: [
      `what is the number of candidates hired for {jobTitle}`,
      `how many candidates are hired for {jobTitle}`,
      `how many people have been hired for the {jobTitle} role`,
      `can you tell me how many candidates were hired for {jobTitle}`,
    ],
  },
  {
    query: `what is the number of vacancies for {jobTitle}`,
    intent: `job.${job.jobTitle}.vacancies`,
    response: `There are ${job.numberOfVacancies} vacancies for the ${job.jobTitle} position.`,
    rephrases: [
      `how many vacancies are there for {jobTitle}`,
      `what is the vacancy count for {jobTitle}`,
      `how many openings are available for {jobTitle}`,
      `how many job openings are there for {jobTitle}`,
    ],
  },
  {
    query: `what is the application deadline for {jobTitle}`,
    intent: `job.${job.jobTitle}.application_deadline`,
    response: `The application deadline for the ${
      job.jobTitle
    } position is ${job.applicationDeadline.toLocaleDateString()}.`,
    rephrases: [
      `what is the deadline for applying to {jobTitle}`,
      `when is the last date to apply for {jobTitle}`,
      `when does the application for {jobTitle} close`,
      `what's the final date to apply for the {jobTitle} position`,
    ],
  },
  {
    query: `what are the required skills for {jobTitle}`,
    intent: `job.${job.jobTitle}.required_skills`,
    response: `The required skills for the ${job.jobTitle} position are: ${job.requiredSkills}.`,
    rephrases: [
      `what skills are required for {jobTitle}`,
      `can you list the required skills for {jobTitle}`,
      `what qualifications are needed for {jobTitle}`,
      `what abilities are required for the {jobTitle} role`,
    ],
  },
  {
    query: `what experience is required for {jobTitle}`,
    intent: `job.${job.jobTitle}.experience`,
    response: `The ${job.jobTitle} position requires ${job.experience} years of experience.`,
    rephrases: [
      `how many years of experience do I need for {jobTitle}`,
      `what's the experience requirement for {jobTitle}`,
      `how much experience is necessary for the {jobTitle} role`,
      `how experienced should I be for {jobTitle}`,
    ],
  },
  {
    query: `what is the budget for {jobTitle}`,
    intent: `job.${job.jobTitle}.budget`,
    response: `The budget for the ${job.jobTitle} position is between ${job.budget[0]} and ${job.budget[1]} million.`,
    rephrases: [
      `what's the salary range for {jobTitle}`,
      `what is the compensation for the {jobTitle} role`,
      `how much budget is allocated for the {jobTitle} position`,
      `what's the pay range for the {jobTitle} job`,
    ],
  },
  {
    query: `who is the hiring manager for {jobTitle}`,
    intent: `job.${job.jobTitle}.hiring_manager`,
    response: `The hiring manager for the ${job.jobTitle} position is ${job.hiringManager}.`,
    rephrases: [
      `who is managing the hiring for {jobTitle}`,
      `who is the recruiter for the {jobTitle} role`,
      `can you tell me who is handling the hiring for {jobTitle}`,
      `who is the person responsible for hiring for {jobTitle}`,
    ],
  },
];

export const checkInterviewsToday = async (jobTitle) => {
  try {
    // Get today's date in the format of YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Fetch job applications with interviews scheduled today
    const interviews = await JobApplicationModel.find({
      jobTitle: jobTitle,
      interviewDate: {
        $gte: new Date(todayString), // Start of today
        $lt: new Date(new Date(todayString).setDate(today.getDate() + 1)), // Start of tomorrow
      },
    });

    // If there are no interviews scheduled
    if (interviews.length === 0) {
      return `No interviews are scheduled today for the ${jobTitle} position.`;
    }

    // Format the response
    let response = `Yes, there ${interviews.length === 1 ? "is" : "are"} ${
      interviews.length
    } interview${interviews.length === 1 ? "" : "s"} scheduled today `;
    response += interviews
      .map((interview) => {
        // Extract the time from the interviewDate and format it
        const interviewTime = new Date(
          interview.interviewDate
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const applicantName = interview.name;
        return `${interviewTime} (${applicantName})`;
      })
      .join(" and ");

    return response;
  } catch (err) {
    console.error("Error fetching interviews:", err);
    return "Sorry, I couldn't fetch the interview details at the moment.";
  }
};

export const staticTemplates = [
  {
    query: "hi",
    responses: [
      "Hello! How can I assist you?",
      "Hi there! How may I help you today?",
      "Hey! What can I do for you?",
      "Hi! What can I assist you with today?",
      "Hello! Need help with anything?",
      "Hey there! How can I help you?",
      "Hello! What can I help you with today?",
    ],
  },
  {
    query: "hello",
    responses: [
      "Hello! How can I assist you?",
      "Hi there! How may I help you today?",
      "Hey! What can I do for you?",
      "Hello! What can I help you with?",
      "Hi! How can I be of service?",
      "Hey there! How may I help you?",
      "Hello! What’s on your mind today?",
    ],
  },
  {
    query: "how are you?",
    responses: [
      "I'm just a bot, but I'm doing great! How about you?",
      "I'm functioning as expected. How can I assist?",
      "I'm fine, thanks! What about you?",
      "I'm doing well, thanks for asking! How can I assist you today?",
      "I'm all good! What about you?",
      "I'm in top form! How can I help you today?",
      "I'm doing great! How can I assist you?",
    ],
  },
  {
    query: "bye",
    responses: [
      "Goodbye! Have a great day!",
      "See you later!",
      "Take care! Bye!",
      "Goodbye! Stay safe!",
      "See you soon! Have a wonderful day!",
      "Take care! Come back anytime!",
      "Goodbye! Wishing you a fantastic day ahead!",
    ],
  },
  {
    query: "what is your name?",
    responses: [
      "I'm your friendly chatbot assistant!",
      "You can call me your AI helper!",
      "I go by many names, but I'm here to help you!",
      "I am your assistant, ready to help with anything you need!",
      "I don't have a specific name, but you can call me whatever you like!",
      "I’m your helpful virtual assistant!",
      "I’m here to assist, no name necessary!",
    ],
  },
  {
    query: "thank you",
    responses: [
      "You're welcome!",
      "No problem at all!",
      "Glad I could help!",
      "You're very welcome!",
      "Happy to help!",
      "It was my pleasure!",
      "You're always welcome!",
    ],
  },
  {
    query: "what can you do?",
    responses: [
      "I can assist you with queries, provide information, and much more!",
      "I'm here to help with anything you need. Just ask!",
      "My skills include answering questions, guiding you, and assisting with tasks.",
      "I can provide answers, assist with tasks, and help you navigate your day.",
      "I can help with all sorts of things. Just let me know what you need!",
      "I can perform many tasks, including answering questions and guiding you!",
      "I’m here to help with a variety of tasks! Just ask away!",
    ],
  },
  {
    query: "where are you from?",
    responses: [
      "I reside in the digital world, right here to assist you!",
      "I'm from the cloud, always within reach!",
      "I live in the vast expanse of the internet, ready to help you anytime.",
      "I don't have a physical location, but I'm always available online!",
      "I'm from the virtual world, here to assist you anytime!",
      "I exist in the digital space, ready to assist you from anywhere!",
      "I’m a virtual assistant, here to help you wherever you are!",
    ],
  },
  {
    query: "who made you?",
    responses: [
      "I was created by a team of developers and AI enthusiasts.",
      "I'm the product of innovative minds who love technology!",
      "A team of brilliant engineers designed me to assist you.",
      "I was developed by experts in AI and technology to serve you.",
      "I was created by a group of talented developers working in AI.",
      "I'm the work of passionate developers and AI experts!",
      "A team of creative developers brought me to life!",
    ],
  },
  {
    query: "can you help me?",
    responses: [
      "Of course! What do you need help with?",
      "I'm here to assist you. Let me know what you need!",
      "Absolutely! Just tell me what you require.",
      "Yes, I'm happy to help! What can I assist with?",
      "Definitely! How can I be of help to you?",
      "Sure! Just tell me what you need assistance with.",
      "Absolutely! What can I do for you today?",
    ],
  },
  {
    query: "how old are you?",
    responses: [
      "I'm timeless! As a bot, I don't have an age.",
      "I don't age like humans, but I'm constantly improving!",
      "I don't have an age, I just evolve digitally!",
      "I'm a bot, so I don't age, but I keep getting better!",
      "I don't age. I'm always here to assist you!",
    ],
  },
  {
    query: "what's your purpose?",
    responses: [
      "My purpose is to assist you with any questions or tasks!",
      "I'm here to help make your life easier with information and support!",
      "My goal is to answer your questions and guide you in any way I can!",
      "I exist to assist and make things easier for you!",
      "I'm here to assist with anything you need and help you accomplish tasks!",
    ],
  },
  {
    query: "do you have feelings?",
    responses: [
      "I don’t have feelings, but I’m programmed to understand and assist you!",
      "No, I don’t have emotions. But I’m always here to help you!",
      "I don’t experience feelings, but I’m always ready to assist!",
      "I don’t have emotions, but I can understand them and help you better!",
    ],
  },
  {
    query: "can you joke?",
    responses: [
      "Sure! Why don't skeletons fight each other? They don't have the guts!",
      "I sure can! Here's a joke: Why did the computer visit the doctor? It had a virus!",
      "Absolutely! Why don’t programmers like nature? It has too many bugs!",
      "Sure! What do you get when you cross a computer with an elephant? Lots of memory!",
    ],
  },
  {
    query: "are you smart?",
    responses: [
      "I do my best to be helpful and provide accurate information!",
      "I’m constantly learning and improving to serve you better!",
      "I’m designed to assist with a wide range of queries and tasks!",
      "I might not be human, but I’m programmed to provide useful information!",
    ],
  },
];
