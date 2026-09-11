import express from "express";
import {
  handleLogin,
  handleRegister,
  sendVerificationOtp,
  verifyAccount,
  getCurrentUser,
  updateuser,
  getUserbyemail,
  getSubscription
} from "../controllers/userController.js";

import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/login", handleLogin);

userRouter.post("/register", handleRegister);

// Verification now happens from the profile page, once the user is
// already logged in - both routes act on the authenticated account.
userRouter.post("/send-verification", userAuth, sendVerificationOtp);
userRouter.post("/verify-account", userAuth, verifyAccount);

userRouter.get("/me", userAuth, getCurrentUser);
userRouter.get("/get-email", getUserbyemail);
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
