import express from "express";
import { runCode } from "../controllers/codeController.js";

const codeRouter = express.Router();

codeRouter.post("/run", runCode);

export default codeRouter;