import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
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

    language: {
      type: String,
      required: true,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    expectedDuration: {
      type: Number,
      required: true,
    },

    internalNotes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "started", "completed", "cancelled"],
      default: "scheduled",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    reportGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const interviewModel = mongoose.model("Interview", interviewSchema);

export default interviewModel;
