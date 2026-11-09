import express from "express";
import { runCode } from "../controllers/CodeController.js";
import userAuth from '../middleware/userAuth.js';
const codeRouter = express.Router();

codeRouter.post("/run", userAuth,runCode);

export default codeRouter;
