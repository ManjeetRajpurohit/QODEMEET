import React from "react";

const QuestionPanel = ({
  questions,
  activeQuestion,
  setActiveQuestion,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#08101F] overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-white/10 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {questions?.map((question) => (
            <button
              key={question._id}
              onClick={() =>
                setActiveQuestion(question)
              }
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${
                activeQuestion?._id ===
                question._id
                  ? "bg-violet-600 text-white"
                  : "bg-[#0B1220] text-gray-300 hover:text-white"
              }`}
            >
              {question.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!activeQuestion ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No Question Selected
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-white">
                {activeQuestion.title}
              </h2>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  activeQuestion.difficulty ===
                  "Easy"
                    ? "bg-green-500/20 text-green-300"
                    : activeQuestion.difficulty ===
                      "Medium"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {
                  activeQuestion.difficulty
                }
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">
                Problem Statement
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {
                  activeQuestion.description
                }
              </p>
            </div>

            {/* Examples */}
            {activeQuestion.examples
              ?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">
                  Examples
                </h3>

                <div className="space-y-3">
                  {activeQuestion.examples.map(
                    (
                      example,
                      index
                    ) => (
                      <div
                        key={index}
                        className="bg-[#0B1220] border border-white/10 rounded-xl p-4"
                      >
                        <p className="text-gray-300 text-sm mb-2">
                          <span className="text-white font-medium">
                            Input:
                          </span>{" "}
                          {
                            example.input
                          }
                        </p>

                        <p className="text-gray-300 text-sm mb-2">
                          <span className="text-white font-medium">
                            Output:
                          </span>{" "}
                          {
                            example.output
                          }
                        </p>

                        {example.explanation && (
                          <p className="text-gray-400 text-sm">
                            <span className="text-white font-medium">
                              Explanation:
                            </span>{" "}
                            {
                              example.explanation
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Constraints */}
            {activeQuestion.constraints
              ?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">
                  Constraints
                </h3>

                <ul className="list-disc pl-5 text-gray-300 text-sm space-y-2">
                  {activeQuestion.constraints.map(
                    (
                      constraint,
                      index
                    ) => (
                      <li
                        key={index}
                        className="break-words"
                      >
                        {constraint}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Visible Test Cases */}
            {activeQuestion
              .visibleTestCases
              ?.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">
                  Visible Test Cases
                </h3>

                <div className="space-y-3">
                  {activeQuestion.visibleTestCases.map(
                    (
                      testCase,
                      index
                    ) => (
                      <div
                        key={index}
                        className="bg-[#0B1220] border border-white/10 rounded-xl p-4"
                      >
                        <p className="text-gray-300 text-sm mb-2">
                          <span className="text-white font-medium">
                            Input:
                          </span>{" "}
                          {
                            testCase.input
                          }
                        </p>

                        <p className="text-gray-300 text-sm">
                          <span className="text-white font-medium">
                            Expected Output:
                          </span>{" "}
                          {
                            testCase.output
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
