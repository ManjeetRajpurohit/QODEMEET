import React from "react";
import {
  FileText,
  Code,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Question = () => {
  const question = {
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",

    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",

    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],

    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists",
    ],

    testCases: [
      {
        input: "[2,7,11,15], 9",
        output: "[0,1]",
      },
      {
        input: "[3,2,4], 6",
        output: "[1,2]",
      },
      {
        input: "[3,3], 6",
        output: "[0,1]",
      },
    ],
  };

  const difficultyColors = {
    Easy: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    Hard: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-indigo-400" size={28} />

            <h1 className="text-3xl font-bold">
              {question.title}
            </h1>
          </div>

          <div className="flex gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </span>

            <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm">
              {question.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Description
          </h2>

          <p className="text-gray-300 leading-relaxed">
            {question.description}
          </p>
        </div>

        {/* Examples */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Examples
          </h2>

          <div className="space-y-4">
            {question.examples.map((example, index) => (
              <div
                key={index}
                className="rounded-xl bg-black/30 p-4"
              >
                <p className="mb-2 font-medium">
                  Example {index + 1}
                </p>

                <p className="text-gray-300">
                  <strong>Input:</strong>{" "}
                  {example.input}
                </p>

                <p className="text-gray-300">
                  <strong>Output:</strong>{" "}
                  {example.output}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-400" />
            <h2 className="text-xl font-semibold">
              Constraints
            </h2>
          </div>

          <ul className="space-y-2">
            {question.constraints.map((constraint, index) => (
              <li
                key={index}
                className="text-gray-300 list-disc ml-5"
              >
                {constraint}
              </li>
            ))}
          </ul>
        </div>

        {/* Test Cases */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="text-indigo-400" />

            <h2 className="text-xl font-semibold">
              Visible Test Cases
            </h2>
          </div>

          <div className="space-y-4">
            {question.testCases.map((testCase, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle
                    size={18}
                    className="text-green-400"
                  />

                  <span className="font-medium">
                    Test Case {index + 1}
                  </span>
                </div>

                <p className="text-gray-300">
                  <strong>Input:</strong>{" "}
                  {testCase.input}
                </p>

                <p className="text-gray-300 mt-2">
                  <strong>Output:</strong>{" "}
                  {testCase.output}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Question;