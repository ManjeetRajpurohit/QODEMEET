import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],

    constraints: [String],

    visibleTestCases: [
      {
        input: String,
        output: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const QuestionModel = mongoose.model(
  "Question",
  questionSchema
);

export default QuestionModel;