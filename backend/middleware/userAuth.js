
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const createUserAuth = ({ allowUnassignedRole = false } = {}) => {
  return async (req, res, next) => {
    // 1. Read authentication cookie
    const token = req.cookies?.qodemeet_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login.",
      });
    }

    // 2. Verify JWT configuration
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(503).json({
        success: false,
        message: "Authentication service unavailable",
      });
    }

    // 3. Verify JWT signature and expiration
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    // 4. Validate JWT payload
    if (
      !decoded ||
      typeof decoded.id !== "string" ||
      !mongoose.isValidObjectId(decoded.id) ||
      !Number.isSafeInteger(decoded.tokenVersion) ||
      decoded.tokenVersion < 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    // 5. Fetch latest user and validate session version
    let user;

    try {
      user = await userModel.findById(decoded.id);
    } catch (error) {
      console.error("User authentication database error:", error.message);

      return res.status(503).json({
        success: false,
        message: "Authentication service temporarily unavailable",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // 6. Validate session revocation
    if (decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // 7. Validate user role
    const validRole = ["candidate", "interviewer"].includes(user.role);

    const pendingGoogleRole =
      allowUnassignedRole && user.role === null;

    if (!validRole && !pendingGoogleRole) {
      return res.status(403).json({
        success: false,
        message: "User session is no longer valid",
      });
    }

    // 8. Attach authenticated user to request
    req.user = user;

    return next();
  };
};

// Standard authentication
const userAuth = createUserAuth();

// Allows Google users to access role-selection-related endpoints
export const userAuthAllowUnassigned = createUserAuth({
  allowUnassignedRole: true,
});

export default userAuth;
