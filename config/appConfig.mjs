import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import { createServer } from "http";
import { Server } from "socket.io";

// Store socket instances mapped to usernames
const userSockets = new Map();

const configureApp = () => {
  const app = express();

  // Security and parsing middleware
  app.use(helmet());
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression({ level: 9 }));

  // CORS settings
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sameer-yadav.site",
    "http://localhost:53380",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.options("*", cors()); // Handle preflight requests

  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  // Socket.IO middleware for authentication
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("Authentication failed: Username is required"));
    }
    socket.username = username;
    next();
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    const username = socket.username;

    // Store the socket instance mapped to username
    userSockets.set(username, socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      userSockets.delete(username);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${username}:`, error);
    });
  });

  // Make io instance available throughout the app
  app.set("io", io);
  app.set("userSockets", userSockets);

  // Swagger documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Utility function to send message to specific user
  app.locals.sendToUser = (username, eventName, data) => {
    const socketId = userSockets.get(username);
    if (socketId) {
      io.to(socketId).emit(eventName, data);
      return true;
    }
    return false;
  };

  return { app, server, io };
};

export default configureApp;
