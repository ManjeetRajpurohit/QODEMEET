import axios from "axios";
import QuestionModel from "../models/questionModel.js";

const languageMap = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
};

const runOnJudge0 = async (code, language_id, stdin) => {
  const response = await axios.post(
    `https://${process.env.RAPID_API_HOST}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id,
      stdin: stdin || "",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    }
  );

  return response.data;
};

const runCode = async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        success: false,
        message: "Unsupported Language",
      });
    }

    // No question attached — behave like a plain scratch-run (old behavior).
    if (!questionId) {
      const result = await runOnJudge0(code, language_id, "");

      return res.json({
        success: true,
        mode: "raw",
        output:
          result.stdout ||
          result.stderr ||
          result.compile_output ||
          "No Output",
      });
    }

    const question = await QuestionModel.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const testCases = question.visibleTestCases;

    // Question exists but has no test cases defined — fall back to raw run.
    if (!testCases || testCases.length === 0) {
      const result = await runOnJudge0(code, language_id, "");

      return res.json({
        success: true,
        mode: "raw",
        output:
          result.stdout ||
          result.stderr ||
          result.compile_output ||
          "No Output",
      });
    }

    const results = [];

    for (const testCase of testCases) {
      const result = await runOnJudge0(code, language_id, testCase.input);

      const actual = (result.stdout || "").trim();
      const expected = (testCase.output || "").trim();
      const errorOutput = result.stderr || result.compile_output;

      results.push({
        input: testCase.input,
        expected,
        actual: errorOutput ? errorOutput.trim() : actual,
        passed: !errorOutput && actual === expected,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;

    return res.json({
      success: true,
      mode: "graded",
      results,
      passedCount,
      totalCount: results.length,
    });
  } catch (error) {
    console.log("Judge0 Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Execution Failed",
    });
  }
};

export { runCode };