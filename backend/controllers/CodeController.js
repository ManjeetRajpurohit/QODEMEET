
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

const runOnJudge0 = async (code, language_id, stdin) => {
  const response = await axios.post(
    `https://${process.env.RAPID_API_HOST}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id,
      stdin: stdin || "",
    },
    {
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    }
  );

  return response.data;
};

const getOutput = (result) => {
  const output =
    result.stdout ||
    result.stderr ||
    result.compile_output ||
    result.message ||
    "No Output";

  return String(output).slice(0, MAX_OUTPUT_LENGTH);
};

const runCode = async (req, res) => {
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

    const language_id = languageMap[language];

    // Scratch execution.
    if (!questionId) {
      const result = await runOnJudge0(
        code,
        language_id,
        ""
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

    // No test cases: preserve scratch execution behavior.
    if (testCases.length === 0) {
      const result = await runOnJudge0(
        code,
        language_id,
        ""
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

    for (const testCase of testCases) {
      const result = await runOnJudge0(
        code,
        language_id,
        testCase.input
      );

      const actual = (result.stdout || "").trim();
      const expected = (testCase.output || "").trim();

      const errorOutput =
        result.stderr || result.compile_output;

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

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Code execution timed out",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Code execution service failed",
    });
  }
};

export { runCode };
