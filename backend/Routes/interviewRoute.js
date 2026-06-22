import express from "express";
import {
  schedule,
  getMyInterviews,
  getCompletedInterviews,
  cancelInterview,
  getSingleInterview,
  startInterview,
  endInterview,
} from "../controllers/interviewController.js";
import userAuth from "../middleware/userAuth.js";

const interviewRouter = express.Router();

interviewRouter.get("/", userAuth, getMyInterviews);
interviewRouter.get("/completed", userAuth, getCompletedInterviews);
interviewRouter.post("/cancel/:id", userAuth, cancelInterview);
interviewRouter.post("/schedule", userAuth, schedule);
interviewRouter.get("/:id", userAuth, getSingleInterview);
interviewRouter.post("/start/:id", userAuth, startInterview);
interviewRouter.post("/end/:id", userAuth, endInterview);

export default interviewRouter;
