import express from "express";
import {
  handleLogin,
  handleRegister,
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

userRouter.get("/me", userAuth, getCurrentUser);
userRouter.get("/get-email",getUserbyemail );
userRouter.get("/subscription", userAuth, getSubscription);userRouter.post(
  "/update",
  userAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateuser
);

export default userRouter;