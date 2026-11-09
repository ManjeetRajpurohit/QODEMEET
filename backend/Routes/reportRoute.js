
import express from "express";

import {
  AddReport,
  listAllReports,
  singleReport,
} from "../controllers/reportController.js";

import userAuth from "../middleware/userAuth.js";
import requireInterviewer from "../middleware/requireInterviewer.js";

const reportRouter = express.Router();

// Authenticated users can access only their own reports.
// Controller performs participant-level authorization.
reportRouter.get("/", userAuth, listAllReports);

reportRouter.get("/:id", userAuth, singleReport);

// Only authenticated interviewers can generate reports.
reportRouter.post(
  "/add",
  userAuth,
  requireInterviewer,
  AddReport
);

export default reportRouter;
