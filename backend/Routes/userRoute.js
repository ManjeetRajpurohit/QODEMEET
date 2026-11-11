
import express from "express";

import {
  handleLogin,
  handleRegister,
  selectRole,
  sendVerificationOtp,
  verifyAccount,
  getCurrentUser,
  logout,
  updateuser,
  getUserbyemail,
  getSubscription,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from "../controllers/userController.js";

import requireInterviewer from "../middleware/requireInterviewer.js";

import userAuth, {
  userAuthAllowUnassigned,
} from "../middleware/userAuth.js";

import upload from "../middleware/multer.js";

import {
  loginLimiter,
  loginAccountLimiter,
  registrationLimiter,
  registrationAccountLimiter,

  passwordResetRequestLimiter,
  passwordResetRequestAccountLimiter,

  passwordResetVerifyLimiter,
  passwordResetVerifyAccountLimiter,

  passwordResetCompleteLimiter,
  passwordResetCompleteAccountLimiter,

  verificationOtpRequestLimiter,
  verificationOtpRequestAccountLimiter,

  verificationOtpVerifyLimiter,
  verificationOtpVerifyAccountLimiter,
} from "../middleware/authRateLimit.js";

const userRouter = express.Router();

// ==========================================
// PROFILE FILE UPLOAD MIDDLEWARE
// ==========================================

const profileUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

const handleProfileUpload = (req, res, next) => {
  profileUpload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.name === "MulterError") {
      let message = "Invalid file upload";

      if (error.code === "LIMIT_FILE_SIZE") {
        message = "Uploaded files must not exceed 5MB";
      } else if (error.code === "LIMIT_FILE_COUNT") {
        message = "Maximum 2 files can be uploaded";
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Unexpected upload field";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return next(error);
  });
};

// ==========================================
// LOGIN AND REGISTRATION
// ==========================================

// Both IP and username-based limits must allow the request.
userRouter.post(
  "/login",
  loginLimiter,
  loginAccountLimiter,
  handleLogin
);

// Both IP and email-based limits must allow the request.
userRouter.post(
  "/register",
  registrationLimiter,
  registrationAccountLimiter,
  handleRegister
);

// ==========================================
// PASSWORD RESET
// ==========================================

// These endpoints intentionally remain public.
// Both IP and account-based limits apply.

userRouter.post(
  "/forgot-password/send-otp",
  passwordResetRequestLimiter,
  passwordResetRequestAccountLimiter,
  requestPasswordResetOtp
);

userRouter.post(
  "/forgot-password/verify-otp",
  passwordResetVerifyLimiter,
  passwordResetVerifyAccountLimiter,
  verifyPasswordResetOtp
);

userRouter.post(
  "/forgot-password/reset",
  passwordResetCompleteLimiter,
  passwordResetCompleteAccountLimiter,
  resetPassword
);

// ==========================================
// ROLE SELECTION AND LOGOUT
// ==========================================

// Pending-role Google users must be able to select a role
// and log out before accessing role-restricted features.

userRouter.post(
  "/select-role",
  userAuthAllowUnassigned,
  selectRole
);

userRouter.post(
  "/logout",
  userAuthAllowUnassigned,
  logout
);

// ==========================================
// ACCOUNT VERIFICATION
// ==========================================

// Authentication must run first because the account-based
// limiter identifies the authenticated user through req.user.

userRouter.post(
  "/send-verification",
  userAuth,
  verificationOtpRequestLimiter,
  verificationOtpRequestAccountLimiter,
  sendVerificationOtp
);

userRouter.post(
  "/verify-account",
  userAuth,
  verificationOtpVerifyLimiter,
  verificationOtpVerifyAccountLimiter,
  verifyAccount
);

// ==========================================
// USER INFORMATION
// ==========================================

userRouter.get(
  "/me",
  userAuthAllowUnassigned,
  getCurrentUser
);

userRouter.get(
  "/get-email",
  userAuth,
  requireInterviewer,
  getUserbyemail
);

userRouter.get(
  "/subscription",
  userAuth,
  getSubscription
);

// ==========================================
// PROFILE UPDATE
// ==========================================

// Authenticate before Multer processes uploaded files.
// Controller performs the remaining field and file validation.

userRouter.post(
  "/update",
  userAuth,
  handleProfileUpload,
  updateuser
);

// ==========================================
// EXPORT
// ==========================================

export default userRouter;

