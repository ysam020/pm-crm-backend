import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Paymaster API Documentation",
    version: "1.0.0",
    description: "Paymaster API Documentation",
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://sameer-yadav.online"
          : "http://localhost:9002",
    },
  ],
};

// Now you can pass `matchedFiles` to Swagger
const options = {
  swaggerDefinition,
  apis: ["./routes/*.mjs", "./routes/**/*.mjs", "./routes/**/**/*.mjs"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
