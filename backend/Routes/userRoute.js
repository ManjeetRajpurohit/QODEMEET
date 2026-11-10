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

import userAuth, { userAuthAllowUnassigned } from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/login", handleLogin);

userRouter.post("/register", handleRegister);

userRouter.post("/forgot-password/send-otp", requestPasswordResetOtp);
userRouter.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
userRouter.post("/forgot-password/reset", resetPassword);

userRouter.post("/select-role", userAuthAllowUnassigned, selectRole);
userRouter.post("/logout", userAuthAllowUnassigned, logout);
// Verification now happens from the profile page, once the user is
// already logged in - both routes act on the authenticated account.
userRouter.post("/send-verification", userAuth, sendVerificationOtp);
userRouter.post("/verify-account", userAuth, verifyAccount);

userRouter.get("/me", userAuthAllowUnassigned, getCurrentUser);
userRouter.get(
  "/get-email",
  userAuth,
  requireInterviewer,
  getUserbyemail
);
userRouter.get("/subscription", userAuth, getSubscription);

userRouter.post(
  "/update",
  userAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateuser
);

export default userRouter;
