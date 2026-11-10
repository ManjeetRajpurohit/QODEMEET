import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const createUserAuth = ({ allowUnassignedRole = false } = {}) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.qodemeet_token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not Authorized. Please login.",
        });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
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
        return res.status(401).json({ success: false, message: "Invalid session" });
      }

      const user = await userModel.findById(decoded.id);
      if (!user || decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }

      const validRole = ["candidate", "interviewer"].includes(user.role);
      const pendingGoogleRole = allowUnassignedRole && user.role == null;
      if (!validRole && !pendingGoogleRole) {
        return res.status(403).json({
          success: false,
          message: "User session is no longer valid",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      if (!["JsonWebTokenError", "TokenExpiredError"].includes(error.name)) {
        console.error("Authentication middleware error:", error.message);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }
  };
};

const userAuth = createUserAuth();
export const userAuthAllowUnassigned = createUserAuth({
  allowUnassignedRole: true,
});

export default userAuth;
