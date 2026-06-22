import React from "react";

const QuestionPanel = ({
  questions,
  activeQuestion,
  setActiveQuestion,
}) => {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-3 bg-[#08101F]">
        <div className="flex gap-2 overflow-x-auto">
          {questions?.map((question) => (
            <button
              key={question._id}
              onClick={() =>
                setActiveQuestion(question)
              }
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
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

      {activeQuestion && (
        <div className="border-b border-white/10 bg-[#08101F] p-4 overflow-y-auto">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold text-white">
              {activeQuestion.title}
            </h2>

            <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
              {activeQuestion.difficulty}
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-5">
            {activeQuestion.description}
          </p>

          {activeQuestion.examples?.length >
            0 && (
            <div className="mb-5">
              <h3 className="text-white font-medium mb-2">
                Examples
              </h3>

              {activeQuestion.examples.map(
                (example, index) => (
                  <div
                    key={index}
                    className="bg-[#0B1220] rounded-xl p-3 mb-3"
                  >
                    <p className="text-gray-300">
                      Input: {example.input}
                    </p>

                    <p className="text-gray-300">
                      Output:
                      {example.output}
                    </p>

                    <p className="text-gray-400">
                      {
                        example.explanation
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {activeQuestion.constraints
            ?.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">
                Constraints
              </h3>

              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                {activeQuestion.constraints.map(
                  (
                    constraint,
                    index
                  ) => (
                    <li key={index}>
                      {constraint}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default QuestionPanel;