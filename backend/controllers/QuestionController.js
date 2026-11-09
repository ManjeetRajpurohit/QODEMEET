
import mongoose from "mongoose";
import QuestionModel from "../models/questionModel.js";

// ADD QUESTION
const AddQuestion = async (req, res) => {
  try {
    const {
      title,
      category,
      difficulty,
      description,
      examples,
      constraints,
      visibleTestCases,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 200 ||
      typeof category !== "string" ||
      !category.trim() ||
      category.length > 100 ||
      typeof description !== "string" ||
      !description.trim() ||
      description.length > 20000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question details",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty",
      });
    }

    if (
      !Array.isArray(examples) ||
      !Array.isArray(constraints) ||
      !Array.isArray(visibleTestCases) ||
      examples.length > 20 ||
      constraints.length > 50 ||
      visibleTestCases.length > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question examples, constraints or test cases",
      });
    }

    const existingQuestion = await QuestionModel.findOne({
      title: title.trim(),
    });

    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        message: "Question already exists",
      });
    }

    const question = await QuestionModel.create({
      title: title.trim(),
      category: category.trim(),
      difficulty,
      description: description.trim(),
      examples,
      constraints,
      visibleTestCases,
    });

    return res.status(201).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Add question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add question",
    });
  }
};

// DELETE QUESTION
const DeleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await QuestionModel.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete question",
    });
  }
};

// GET ALL QUESTIONS
const ALLquestions = async (req, res) => {
  try {
    const questions = await QuestionModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Get questions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve questions",
    });
  }
};

// GET SINGLE QUESTION
const singleQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await QuestionModel.findById(id).lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Get single question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve question",
    });
  }
};

export {
  AddQuestion,
  DeleteQuestion,
  singleQuestion,
  ALLquestions,
};
