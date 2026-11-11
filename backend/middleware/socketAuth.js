
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import interviewModel from "../models/interviewModel.js";

const socketAuth = async (socket, next) => {
  const token = socket.request.cookies?.qodemeet_token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return next(new Error("Authentication service unavailable"));
  }

  let decoded;

  // 1. Verify JWT
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return next(new Error("Invalid or expired authentication token"));
  }

  // 2. Validate JWT payload
  if (
    typeof decoded?.id !== "string" ||
    !mongoose.isValidObjectId(decoded.id) ||
    !Number.isSafeInteger(decoded.tokenVersion) ||
    decoded.tokenVersion < 0
  ) {
    return next(new Error("Invalid authentication token"));
  }

  // 3. Validate user and session
  try {
    const user = await userModel
      .findById(decoded.id)
      .select("_id name role tokenVersion");

    if (
      !user ||
      decoded.tokenVersion !== (user.tokenVersion ?? 0) ||
      !["candidate", "interviewer"].includes(user.role)
    ) {
      return next(new Error("Session expired or unauthorized"));
    }

    socket.data.user = user;
    socket.data.tokenVersion = decoded.tokenVersion;

    return next();
  } catch (error) {
    console.error("Socket authentication database error:", error.message);

    return next(new Error("Authentication service unavailable"));
  }
};

// 4. Revalidate session before authorizing interview access
const validateSocketSession = async (socket) => {
  try {
    const userId = socket.data.user?._id;

    if (!userId) return false;

    const user = await userModel
      .findById(userId)
      .select("_id name role tokenVersion");

    if (
      !user ||
      !["candidate", "interviewer"].includes(user.role) ||
      user.tokenVersion !== socket.data.tokenVersion
    ) {
      socket.disconnect(true);
      return false;
    }

    socket.data.user = user;

    return true;
  } catch (error) {
    console.error("Socket session validation error:", error.message);
    return false;
  }
};

// 5. Authorize interview room
export const authorizeInterviewRoom = async (socket, roomId) => {
  try {
    if (
      typeof roomId !== "string" ||
      !mongoose.isValidObjectId(roomId) ||
      !socket.data.user
    ) {
      return false;
    }

    // Revalidate session before room authorization
    const sessionValid = await validateSocketSession(socket);

    if (!sessionValid) return false;

    const interview = await interviewModel
      .findById(roomId)
      .select("candidate interviewer status");

    if (
      !interview ||
      interview.status !== "started" ||
      !interview.candidate ||
      !interview.interviewer
    ) {
      return false;
    }

    const userId = socket.data.user._id.toString();
    const candidateId = interview.candidate.toString();
    const interviewerId = interview.interviewer.toString();

    if (
      userId !== candidateId &&
      userId !== interviewerId
    ) {
      return false;
    }

    socket.data.interviewId = roomId;

    socket.data.interviewRole =
      userId === interviewerId
        ? "interviewer"
        : "candidate";

    return true;
  } catch (error) {
    console.error("Interview room authorization error:", error.message);
    return false;
  }
};

export default socketAuth;
