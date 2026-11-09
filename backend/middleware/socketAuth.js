import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import interviewModel from "../models/interviewModel.js";

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel
      .findById(decoded.id)
      .select("_id name role");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};
export const authorizeInterviewRoom = async (socket, roomId) => {
  if (!roomId || !socket.data.user) return false;

  const interview = await interviewModel.findById(roomId);

  if (!interview) return false;

  const userId = socket.data.user._id.toString();

  const isParticipant =
    interview.candidate.toString() === userId ||
    interview.interviewer.toString() === userId;

  if (!isParticipant) return false;

  socket.data.interviewId = roomId;

  return true;
};

export default socketAuth;
