import QuestionModel from "../models/questionModel.js";

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

    const existingQuestion = await QuestionModel.findOne({
      title,
    });

    if (existingQuestion) {
      return res.status(400).json({
        success: false,
        message: "Question already exists",
      });
    }

    const question = await QuestionModel.create({
      title,
      category,
      difficulty,
      description,
      examples,
      constraints,
      visibleTestCases,
    });

    return res.status(201).json({
      success: true,
      question,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const DeleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await QuestionModel.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      question,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ALLquestions = async (req, res) => {
  try {
    const questions = await QuestionModel.find({});

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const singleQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await QuestionModel.findById(id);

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
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  AddQuestion,
  DeleteQuestion,
  singleQuestion,
  ALLquestions,
};