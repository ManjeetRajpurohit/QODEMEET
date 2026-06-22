import express from "express";
import userAuth from "../middleware/userAuth.js";
import {getCandidateDashboard,getInterviewerDashboard} from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get(
  "/candidate-dashboard",
  userAuth,
  getCandidateDashboard
);
dashboardRouter.get(
  "/interviewer-dashboard",
  userAuth,
  getInterviewerDashboard
);

export default dashboardRouter;