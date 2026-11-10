import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import interviewModel from "../models/interviewModel.js";

const socketAuth = async (socket, next) => {
  try {
    const token = socket.request.cookies?.qodemeet_token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("Authentication service unavailable"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      !decoded?.id ||
      !mongoose.isValidObjectId(decoded.id) ||
      !Number.isSafeInteger(decoded.tokenVersion) ||
      decoded.tokenVersion < 0
    ) {
      return next(new Error("Invalid authentication token"));
    }

    const user = await userModel
      .findById(decoded.id)
      .select("_id name role tokenVersion");

    if (
      !user ||
      decoded.tokenVersion !== (user.tokenVersion ?? 0) ||
      !["candidate", "interviewer"].includes(user.role)
    ) {
      return next(new Error("User not authorized"));
    }

    socket.data.user = user;
    return next();
  } catch {
    return next(new Error("Invalid authentication token"));
  }
};

export const authorizeInterviewRoom = async (socket, roomId) => {
  try {
    if (
      typeof roomId !== "string" ||
      !mongoose.isValidObjectId(roomId) ||
      !socket.data.user
    ) {
      return false;
    }

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

    if (userId !== candidateId && userId !== interviewerId) {
      return false;
    }

    socket.data.interviewId = roomId;
    socket.data.interviewRole =
      userId === interviewerId ? "interviewer" : "candidate";

    return true;
  } catch {
    return false;
  }
};

export default socketAuth;
