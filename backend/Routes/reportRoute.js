import express from "express";
import {
  AddReport,
  listAllReports,
  singleReport,
} from "../controllers/reportController.js";
import userAuth from "../middleware/userAuth.js";

const reportRouter = express.Router();

reportRouter.get("/", userAuth, listAllReports);

reportRouter.get("/:id", userAuth, singleReport);
reportRouter.post("/add", AddReport);

export default reportRouter;
