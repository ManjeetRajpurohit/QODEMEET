
import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireInterviewer from "../middleware/requireInterviewer.js";

import {
  AddQuestion,
  DeleteQuestion,
  singleQuestion,
  ALLquestions,
} from "../controllers/QuestionController.js";

const questionRouter = express.Router();

// Read access: authenticated users
questionRouter.get("/", userAuth, ALLquestions);
questionRouter.get("/:id", userAuth, singleQuestion);

// Write access: interviewers only
questionRouter.post(
  "/add",
  userAuth,
  requireInterviewer,
  AddQuestion
);

questionRouter.post(
  "/remove/:id",
  userAuth,
  requireInterviewer,
  DeleteQuestion
);

export default questionRouter;
