import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

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

export default socketAuth;
