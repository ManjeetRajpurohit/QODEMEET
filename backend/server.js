
import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import dns from "dns";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import socketAuth, {
  authorizeInterviewRoom,
} from "./middleware/socketAuth.js";

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

const port = process.env.PORT || 4000;

const app = express();
const server = createServer(app);

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.engine.use(cookieParser());
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

io.on("connection", (socket) => {
  console.log(`Authenticated socket connected: ${socket.id}`);

  // JOIN ROOM
  socket.on("join-room", async (roomId, callback) => {
    try {
      if (
        socket.data.interviewId &&
        socket.data.interviewId !== roomId
      ) {
        return callback?.({
          success: false,
          message: "Already participating in another room",
        });
      }

      const authorized = await authorizeInterviewRoom(
        socket,
        roomId
      );

      if (!authorized) {
        return callback?.({
          success: false,
          message: "Unauthorized interview room",
        });
      }

      socket.join(roomId);

      socket.to(roomId).emit("user-joined");

      callback?.({ success: true });
    } catch (error) {
      console.error("Join room error:", error.message);

      callback?.({
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

    if (
      typeof data.code !== "string" ||
      data.code.length > 100000
    ) return;

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

    if (
      typeof data.language !== "string" ||
      data.language.length > 50
    ) return;

    socket.to(roomId).emit("receive-language-change", {
      language: data.language,
    });
  });

  // WEBRTC OFFER
  socket.on("offer", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (!data.offer || typeof data.offer !== "object") return;

    socket.to(roomId).emit("offer", data.offer);
  });

  // WEBRTC ANSWER
  socket.on("answer", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (!data.answer || typeof data.answer !== "object") return;

    socket.to(roomId).emit("answer", data.answer);
  });

  // ICE CANDIDATE
  socket.on("ice-candidate", async (data) => {
    const roomId = data?.roomId;

    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    if (!data.candidate || typeof data.candidate !== "object") return;

    socket.to(roomId).emit("ice-candidate", data.candidate);
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
  socket.on("screen-share-started", async (roomId) => {
    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    socket.to(roomId).emit(
      "screen-share-started",
      socket.id
    );
  });

  // SCREEN SHARE STOPPED
  socket.on("screen-share-stopped", async (roomId) => {
    if (!(await isAuthorizedInRoom(socket, roomId))) return;

    socket.to(roomId).emit(
      "screen-share-stopped",
      socket.id
    );
  });

  // LEAVE ROOM
  socket.on("leave-room", (roomId) => {
    if (
      !roomId ||
      socket.data.interviewId !== roomId ||
      !socket.rooms.has(roomId)
    ) return;

    socket.to(roomId).emit("user-left");

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

// DATABASE
connectDB();

// SERVER
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
