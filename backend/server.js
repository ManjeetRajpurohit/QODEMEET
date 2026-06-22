import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import dns from "dns";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/mongoDb.js";
import "./config/passport.js";

import userRouter from "./Routes/userRoute.js";
import googleRouter from "./Routes/authRoute.js";
import questionRouter from "./Routes/questionRoute.js";
import interviewRouter from "./Routes/interviewRoute.js";
import reportRouter from "./Routes/reportRoute.js";
import billingRouter from "./Routes/billingRoute.js";
import codeRouter from "./Routes/codeRoute.js";
import dashboardRouter from "./Routes/dashBoardRoute.js";
const port = process.env.PORT || 4000;

const app = express();
const server = createServer(app);

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
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

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined");
  });

  socket.on("send-message", (data) => {
    io.to(data.interviewId).emit("receive-message", data);
  });

  socket.on("code-change", (data) => {
    socket.to(data.roomId).emit("receive-code-change", {
      code: data.code,
    });
  });

  socket.on("cursor-change", (data) => {
    socket.to(data.roomId).emit("receive-cursor-change", {
      lineNumber: data.lineNumber,
      column: data.column,
    });
  });

  socket.on("language-change", (data) => {
    socket.to(data.roomId).emit("receive-language-change", {
      language: data.language,
    });
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("interview-ended", (roomId) => {
    io.to(roomId).emit("interview-ended");
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left");
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-left");
      }
    });
  });
  socket.on("screen-share-started", (roomId) => {
    socket.to(roomId).emit("screen-share-started");
  });

  socket.on("screen-share-stopped", (roomId) => {
    socket.to(roomId).emit("screen-share-stopped");
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/api/auth", googleRouter);
app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/report", reportRouter);
app.use("/api/bill", billingRouter);
app.use("/api/code", codeRouter);
app.use("/api/dashboard", dashboardRouter);
// Database Connection
connectDB();

// Server Start
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
