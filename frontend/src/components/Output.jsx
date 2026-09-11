import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const Output = ({ output }) => {
  const hasOutput = output && typeof output === "object";
  const mode = hasOutput ? output.mode : null;

  return (
    <div className="h-full bg-black border-t border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/10 text-white text-sm font-medium flex items-center justify-between flex-shrink-0">
        <span>Output</span>

        {mode === "graded" && (
          <span
            className={`text-xs font-semibold ${
              output.passedCount === output.totalCount
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {output.passedCount}/{output.totalCount} passed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {mode === "graded" ? (
          <div className="space-y-3">
            {output.results.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 text-sm font-mono ${
                  result.passed
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.passed ? (
                    <CheckCircle2 size={15} className="text-green-400" />
                  ) : (
                    <XCircle size={15} className="text-red-400" />
                  )}
                  <span
                    className={
                      result.passed ? "text-green-400" : "text-red-400"
                    }
                  >
                    Test Case {index + 1} — {result.passed ? "Passed" : "Failed"}
                  </span>
                </div>

                <div className="text-gray-400 space-y-1">
                  <p>
                    <span className="text-gray-500">Input: </span>
                    {result.input || "—"}
                  </p>
                  <p>
                    <span className="text-gray-500">Expected: </span>
                    {result.expected}
                  </p>
                  <p>
                    <span className="text-gray-500">Actual: </span>
                    {result.actual}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-green-400 text-sm whitespace-pre-wrap break-words font-mono">
            {hasOutput
              ? output.output
              : output || "Run code to see output..."}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Output;