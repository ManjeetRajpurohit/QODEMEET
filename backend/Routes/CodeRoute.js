import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

import { runCode } from "../controllers/CodeController.js";
import userAuth from "../middleware/userAuth.js";

const codeRouter = express.Router();

// Per-IP protection against repeated code execution.
const codeExecutionIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: "Too many code execution requests. Please try again later.",
  },
});

// Per-account protection.
const codeExecutionUserLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user._id.toString(),
  message: {
    success: false,
    message: "Code execution limit reached. Please try again in a minute.",
  },
});

codeRouter.post(
  "/run",
  userAuth,
  codeExecutionIpLimiter,
  codeExecutionUserLimiter,
  runCode
);

export default codeRouter;