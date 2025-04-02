import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { Server } from "socket.io";
import passport from "passport";
import MongoStore from "connect-mongo";
import session from "express-session";
import mongoSanitize from "express-mongo-sanitize";
import "../config/passport.mjs";
import "../config/passportWebAuthn.mjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_MONGODB_URI
    : process.env.DEV_MONGODB_URI;

// Store socket instances mapped to usernames
const userSockets = new Map();

const configureApp = () => {
  const app = express();

  // Security and parsing middleware
  app.use(helmet());
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(express.json());
  app.use(
    express.raw({
      type: "application/x-protobuf",
      limit: "10mb",
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression({ level: 9 }));

  // CORS settings
  const allowedOrigins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://192.168.1.107:3000",
    "https://192.168.1.107:3000",
    "http://172.20.10.10:3000",
    "https://172.20.10.10:3000",
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

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset cookie expiration on each request
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: "sessions",
        autoRemove: "interval",
        // autoRemoveInterval: 10, // Check and remove expired sessions every 10 minutes
        touchAfter: 2 * 60, // Session update interval
      }),
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
      },
    })
  );

  // 4. Initialize Passport AFTER session middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // 5. Add your custom session extension middleware
  const extendSession = (req, res, next) => {
    if (req.session && req.user) {
      req.session.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      req.session.lastActiveAt = new Date();
    }
    next();
  };

  app.use(extendSession);
  app.use(mongoSanitize());

  // Setup HTTPS options
  let server;
  let useHttps = false;

  try {
    const httpsOptions = {
      key: fs.readFileSync(
        path.resolve(__dirname, "../../certificates/key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../../certificates/cert.pem")
      ),
    };
    server = createHttpsServer(httpsOptions, app);
    useHttps = true;
  } catch (error) {
    console.warn(
      "Failed to configure HTTPS server, falling back to HTTP:",
      error.message
    );
    server = createHttpServer(app);
  }

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
  app.set("useHttps", useHttps);

  // Swagger documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        docExpansion: "none", // Collapses all tags (Admin, Users, etc.)
        tagsSorter: "alpha", // Sorts tags alphabetically
        operationsSorter: "alpha", // Sorts operations alphabetically
      },
    })
  );

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
