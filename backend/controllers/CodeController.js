
import axios from "axios";
import mongoose from "mongoose";
import QuestionModel from "../models/questionModel.js";

const languageMap = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
};

const MAX_CODE_LENGTH = 50000;
const MAX_TEST_CASES = 20;
const MAX_OUTPUT_LENGTH = 10000;

const JUDGE0_TIMEOUT_MS = 15000;
const TOTAL_EXECUTION_TIMEOUT_MS = 45000;

// ==========================================
// JUDGE0 EXECUTION
// ==========================================

const runOnJudge0 = async (
  code,
  languageId,
  stdin,
  timeoutMs
) => {
  const response = await axios.post(
    `https://${process.env.RAPID_API_HOST}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id: languageId,
      stdin: stdin || "",

      // Resource limits enforced by Judge0.
      cpu_time_limit: 5,
      cpu_extra_time: 1,
      wall_time_limit: 10,
      memory_limit: 256000,
      stack_limit: 64000,
      max_processes_and_or_threads: 30,
    },
    {
      timeout: Math.max(1000, timeoutMs),
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    }
  );

  return response.data;
};

// ==========================================
// OUTPUT HANDLING
// ==========================================

const getOutput = (result) => {
  const output =
    result.stdout ||
    result.stderr ||
    result.compile_output ||
    result.message ||
    result.status?.description ||
    "No Output";

  return String(output).slice(0, MAX_OUTPUT_LENGTH);
};

// ==========================================
// EXECUTION DEADLINE
// ==========================================

const getRemainingTime = (deadline) => {
  const remaining = deadline - Date.now();

  if (remaining <= 0) {
    const error = new Error("Execution deadline exceeded");
    error.code = "TOTAL_EXECUTION_TIMEOUT";
    throw error;
  }

  return Math.min(remaining, JUDGE0_TIMEOUT_MS);
};

// ==========================================
// RUN CODE
// ==========================================

const runCode = async (req, res) => {
  const deadline = Date.now() + TOTAL_EXECUTION_TIMEOUT_MS;

  try {
    const { code, language, questionId } = req.body || {};

    // Validate source code.
    if (
      typeof code !== "string" ||
      !code.trim() ||
      code.length > MAX_CODE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid code or code exceeds 50KB limit",
      });
    }

    // Validate language.
    if (
      typeof language !== "string" ||
      !Object.hasOwn(languageMap, language)
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported Language",
      });
    }

    // Check Judge0 configuration.
    if (
      !process.env.RAPID_API_KEY ||
      !process.env.RAPID_API_HOST
    ) {
      return res.status(503).json({
        success: false,
        message: "Code execution service unavailable",
      });
    }

    const languageId = languageMap[language];

    // Scratch execution.
    if (!questionId) {
      const result = await runOnJudge0(
        code,
        languageId,
        "",
        getRemainingTime(deadline)
      );

      return res.status(200).json({
        success: true,
        mode: "raw",
        output: getOutput(result),
      });
    }

    // Validate question ID.
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await QuestionModel.findById(questionId)
      .select("visibleTestCases");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const testCases = question.visibleTestCases || [];

    // Preserve scratch execution when no visible cases exist.
    if (testCases.length === 0) {
      const result = await runOnJudge0(
        code,
        languageId,
        "",
        getRemainingTime(deadline)
      );

      return res.status(200).json({
        success: true,
        mode: "raw",
        output: getOutput(result),
      });
    }

    if (testCases.length > MAX_TEST_CASES) {
      return res.status(400).json({
        success: false,
        message: "Too many test cases",
      });
    }

    const results = [];

    // Execute cases sequentially to avoid creating an uncontrolled
    // burst of external Judge0 requests.
    for (const testCase of testCases) {
      const result = await runOnJudge0(
        code,
        languageId,
        testCase.input,
        getRemainingTime(deadline)
      );

      const actual = (result.stdout || "").trim();
      const expected = (testCase.output || "").trim();

      const errorOutput =
        result.stderr ||
        result.compile_output ||
        (
          result.status?.id >= 6
            ? result.status.description
            : ""
        );

      results.push({
        input: testCase.input,
        expected,
        actual: String(
          errorOutput || actual
        ).slice(0, MAX_OUTPUT_LENGTH),
        passed: !errorOutput && actual === expected,
      });
    }

    const passedCount = results.filter(
      (result) => result.passed
    ).length;

    return res.status(200).json({
      success: true,
      mode: "graded",
      results,
      passedCount,
      totalCount: results.length,
    });
  } catch (error) {
    console.error(
      "Judge0 Error:",
      error.response?.data || error.message
    );

    if (
      error.code === "ECONNABORTED" ||
      error.code === "TOTAL_EXECUTION_TIMEOUT"
    ) {
      return res.status(504).json({
        success: false,
        message: "Code execution timed out. Please try again.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(503).json({
        success: false,
        message: "Code execution service is busy. Please try again later.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Code execution service failed",
    });
  }
};

export { runCode };
