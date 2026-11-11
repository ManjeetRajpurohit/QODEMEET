import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import dns from "dns";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import attachSocketRateLimit from "./middleware/socketRateLimit.js";

import parseCookies from "./middleware/parseCookies.js";
import socketAuth, { authorizeInterviewRoom } from "./middleware/socketAuth.js";

import connectDB from "./config/mongoDb.js";
import "./config/passport.js";

import userRouter from "./Routes/userRoute.js";
import googleRouter from "./Routes/authRoute.js";
import questionRouter from "./Routes/questionRoute.js";
import interviewRouter from "./Routes/interviewRoute.js";
import reportRouter from "./Routes/reportRoute.js";
import billingRouter from "./Routes/billingRoute.js";
import codeRouter from "./Routes/CodeRoute.js";
import dashboardRouter from "./Routes/dashBoardRoute.js";

import razorpayWebhook from "./controllers/billingWebhookController.js";

const port = process.env.PORT || 4000;

const app = express();

// Render uses a reverse proxy. Trust one proxy hop so req.ip
// identifies the originating client for rate limiting.
app.set("trust proxy", 1);

const server = createServer(app);

// Do not expose Express through the default response header.
app.disable("x-powered-by");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before the server starts");
}

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const frontendOrigin = process.env.FRONTEND_URL?.replace(/\/$/, "");

// Security headers. Keep camera and microphone available to this origin
// because QODEMEET uses WebRTC for interviews.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(self), display-capture=(self)",
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
  }

  next();
});

// CORS must run before body parsing and API route handling.
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Cookie authentication middleware.
app.use(parseCookies);

// RAZORPAY WEBHOOK
// IMPORTANT: This must be registered before express.json().
// Razorpay signature verification requires the original raw request body.
// Its HMAC signature provides authentication, so it does not use browser
// Origin-based CSRF validation.
app.post(
  "/api/bill/webhook",
  express.raw({
    type: "application/json",
    limit: "1mb",
  }),
  razorpayWebhook,
);

// Normal API body parsing.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Cookie authentication requires CSRF protection. Browsers attach Origin
// to cross-origin state-changing requests; accept only the configured app.
app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const requestOrigin = req.get("origin");

  if (!frontendOrigin || requestOrigin !== frontendOrigin) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  return next();
});

app.use(passport.initialize());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.engine.use(parseCookies);
app.set("io", io);

// Authenticate every socket connection.
io.use(socketAuth);

// Check that socket belongs to the authorized room.
const isAuthorizedInRoom = async (socket, roomId) => {
  try {
    if (
      !roomId ||
      typeof roomId !== "string" ||
      !socket.data.user ||
      socket.data.interviewId !== roomId ||
      !socket.rooms.has(roomId)
    ) {
      return false;
    }

    return await authorizeInterviewRoom(socket, roomId);
  } catch (error) {
    console.error("Room authorization error:", error.message);
    return false;
  }
};

const isValidSessionDescription = (description) => {
  if (
    !description ||
    typeof description !== "object" ||
    Array.isArray(description)
  ) {
    return false;
  }

  if (
    !["offer", "answer"].includes(description.type) ||
    typeof description.sdp !== "string" ||
    !description.sdp.trim() ||
    description.sdp.length > 100000
  ) {
    return false;
  }

  return true;
};

const isValidIceCandidate = (candidate) => {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  if (
    typeof candidate.candidate !== "string" ||
    !candidate.candidate.trim() ||
    candidate.candidate.length > 4096
  ) {
    return false;
  }

  if (
    candidate.sdpMid !== undefined &&
    candidate.sdpMid !== null &&
    typeof candidate.sdpMid !== "string"
  ) {
    return false;
  }

  if (
    candidate.sdpMLineIndex !== undefined &&
    candidate.sdpMLineIndex !== null &&
    (!Number.isInteger(candidate.sdpMLineIndex) || candidate.sdpMLineIndex < 0)
  ) {
    return false;
  }

  if (
    candidate.usernameFragment !== undefined &&
    candidate.usernameFragment !== null &&
    typeof candidate.usernameFragment !== "string"
  ) {
    return false;
  }

  return true;
};

io.on("connection", (socket) => {
  // Apply per-socket event rate limits.
  attachSocketRateLimit(socket);

  socket.join(`user:${socket.data.user._id.toString()}`);
  console.log(`Authenticated socket connected: ${socket.id}`);
  // JOIN ROOM

  // JOIN ROOM
  socket.on("join-room", async (roomId, callback) => {
    try {
      if (!roomId || typeof roomId !== "string") {
        return callback?.({
          success: false,
          message: "Invalid interview room",
        });
      }

      if (socket.data.interviewId && socket.data.interviewId !== roomId) {
        return callback?.({
          success: false,
          message: "Already participating in another room",
        });
      }

      const authorized = await authorizeInterviewRoom(socket, roomId);

      if (!authorized) {
        return callback?.({
          success: false,
          message: "Unauthorized interview room",
        });
      }

      // Avoid duplicate join notifications.
      if (socket.rooms.has(roomId)) {
        return callback?.({
          success: true,
          alreadyJoined: true,
        });
      }

      await socket.join(roomId);

      socket.to(roomId).emit("user-joined");

      return callback?.({ success: true });
    } catch (error) {
      console.error("Join room error:", error.message);

      return callback?.({
        success: false,
        message: "Unable to join room",
      });
    }
  });

  // CHAT
  socket.on("send-message", async (data, callback) => {
    try {
      const roomId = data?.interviewId;

      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return callback?.({ success: false });
      }

      if (
        typeof data.message !== "string" ||
        !data.message.trim() ||
        data.message.length > 2000
      ) {
        return callback?.({ success: false });
      }

      io.to(roomId).emit("receive-message", {
        interviewId: roomId,
        sender: socket.data.user._id.toString(),
        senderName: socket.data.user.name,
        message: data.message.trim(),
        createdAt: new Date(),
      });

      callback?.({ success: true });
    } catch (error) {
      console.error("Chat error:", error.message);
      callback?.({ success: false });
    }
  });

  // CODE CHANGE
  socket.on("code-change", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (typeof data.code !== "string" || data.code.length > 100000) return;

    socket.to(roomId).emit("receive-code-change", {
      code: data.code,
    });
  });

  // CURSOR CHANGE
  socket.on("cursor-change", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    socket.to(roomId).emit("receive-cursor-change", {
      lineNumber: Number(data.lineNumber) || 1,
      column: Number(data.column) || 1,
    });
  });

  // LANGUAGE CHANGE
  socket.on("language-change", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (typeof data.language !== "string" || data.language.length > 50) return;

    socket.to(roomId).emit("receive-language-change", {
      language: data.language,
    });
  });

  // WEBRTC OFFER

  // WEBRTC OFFER
  socket.on("offer", async (data) => {
    try {
      const roomId = data?.roomId;
      const offer = data?.offer;

      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return;
      }

      if (!isValidSessionDescription(offer) || offer.type !== "offer") {
        return;
      }

      socket.to(roomId).emit("offer", offer);
    } catch (error) {
      console.error("WebRTC offer error:", error.message);
    }
  });

  // WEBRTC ANSWER
  socket.on("answer", async (data) => {
    try {
      const roomId = data?.roomId;
      const answer = data?.answer;

      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return;
      }

      if (!isValidSessionDescription(answer) || answer.type !== "answer") {
        return;
      }

      socket.to(roomId).emit("answer", answer);
    } catch (error) {
      console.error("WebRTC answer error:", error.message);
    }
  });

  // ICE CANDIDATE
  socket.on("ice-candidate", async (data) => {
    try {
      const roomId = data?.roomId;
      const candidate = data?.candidate;

      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return;
      }

      if (!isValidIceCandidate(candidate)) {
        return;
      }

      socket.to(roomId).emit("ice-candidate", candidate);
    } catch (error) {
      console.error("ICE candidate error:", error.message);
    }
  });

  // END INTERVIEW
  // Only the interviewer can end the interview.
  socket.on("interview-ended", async (roomId) => {
    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (socket.data.interviewRole !== "interviewer") {
      return;
    }

    io.to(roomId).emit("interview-ended");
  });

  // SCREEN SHARE STARTED

  // SCREEN SHARE STARTED
  socket.on("screen-share-started", async (roomId) => {
    try {
      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return;
      }

      // Ignore duplicate start notifications.
      if (socket.data.isScreenSharing === true) {
        return;
      }

      socket.data.isScreenSharing = true;

      socket.to(roomId).emit("screen-share-started", socket.id);
    } catch (error) {
      console.error("Screen share start error:", error.message);
    }
  });

  // SCREEN SHARE STOPPED
  socket.on("screen-share-stopped", async (roomId) => {
    try {
      if (!(await isAuthorizedInRoom(socket, roomId))) {
        return;
      }

      // A participant cannot stop a share that wasn't started.
      if (socket.data.isScreenSharing !== true) {
        return;
      }

      socket.data.isScreenSharing = false;

      socket.to(roomId).emit("screen-share-stopped", socket.id);
    } catch (error) {
      console.error("Screen share stop error:", error.message);
    }
  });

  // LEAVE ROOM
  socket.on("leave-room", (roomId) => {
    if (
      !roomId ||
      socket.data.interviewId !== roomId ||
      !socket.rooms.has(roomId)
    )
      return;

    socket.to(roomId).emit("user-left");

    if (socket.data.isScreenSharing === true) {
      socket.to(roomId).emit("screen-share-stopped", socket.id);

      socket.data.isScreenSharing = false;
    }

    socket.leave(roomId);

    socket.data.interviewId = null;
    socket.data.interviewRole = null;
  });

  // DISCONNECT
  socket.on("disconnecting", () => {
    const roomId = socket.data.interviewId;

    if (roomId && socket.rooms.has(roomId)) {
      socket.to(roomId).emit("user-left");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ROUTES
app.use("/api/auth", googleRouter);
app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/report", reportRouter);
app.use("/api/bill", billingRouter);
app.use("/api/code", codeRouter);
app.use("/api/dashboard", dashboardRouter);

// Return a consistent JSON response for unknown API endpoints.
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Centralized error handling.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : Number.isInteger(error.status) &&
          error.status >= 400 &&
          error.status <= 599
        ? error.status
        : 500;

  if (statusCode >= 500) {
    console.error("Unhandled request error:", error.message);
  }

  const message =
    statusCode === 413
      ? "Request payload is too large"
      : statusCode === 400
        ? "Invalid request payload"
        : statusCode >= 500
          ? "Internal server error"
          : "Request could not be processed";

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start accepting traffic only after MongoDB is connected.
const startServer = async () => {
  try {
    await connectDB();

    server.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
