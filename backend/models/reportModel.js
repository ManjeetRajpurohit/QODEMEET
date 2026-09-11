import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    interviewDate: {
      type: Date,
      required: true,
    },

    overallScore: {
      type: Number,
      default: 0,
    },

    communication: {
      type: Number,
      default: 0,
    },

    problemSolving: {
      type: Number,
      default: 0,
    },

    technicalSkills: [
      {
        name: {
          type: String,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],

    strengths: {
      type: [String],
      default: [],
    },

    areasForImprovement: {
      type: [String],
      default: [],
    },

    aiFeedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
const reportModel = mongoose.model("Report", reportSchema);

export default reportModel;