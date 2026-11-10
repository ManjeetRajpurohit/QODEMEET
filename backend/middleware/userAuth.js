import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.qodemeet_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded?.id || !mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user || decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (!["candidate", "interviewer"].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: "User session is no longer valid",
      });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

export default userAuth;
