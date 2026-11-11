
import mongoose from "mongoose";
import reportModel from "../models/reportModel.js";
import interviewModel from "../models/interviewModel.js";
import userModel from "../models/userModel.js";
import sendReportMail from "../utils/sendReportMail.js";

// ==========================================
// GET ALL REPORTS
// ==========================================

const listAllReports = async (req, res) => {
  try {
    if (!["candidate", "interviewer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const field =
      req.user.role === "candidate"
        ? "candidate"
        : "interviewer";

    const reports = await reportModel
      .find({ [field]: req.user._id })
      // Only expose the identity fields required by the UI.
      .populate("candidate", "name avatar")
      .populate("interviewer", "name avatar")
      .sort({ interviewDate: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("List reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve reports",
    });
  }
};

// ==========================================
// GET SINGLE REPORT
// ==========================================

const singleReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    if (!["candidate", "interviewer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const report = await reportModel
      .findOne({
        _id: id,
        $or: [
          { candidate: req.user._id },
          { interviewer: req.user._id },
        ],
      })
      // Emails and other unnecessary user fields are excluded.
      .populate("candidate", "name avatar")
      .populate("interviewer", "name avatar");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Single report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve report",
    });
  }
};

// ==========================================
// CREATE REPORT
// ==========================================

const AddReport = async (req, res) => {
  try {
    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Only interviewers can create reports",
      });
    }

    const {
      interview: interviewId,
      title,
      overallScore,
      communication,
      problemSolving,
      technicalSkills,
      strengths,
      areasForImprovement,
      aiFeedback,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await interviewModel.findOne({
      _id: interviewId,
      interviewer: req.user._id,
      status: "completed",
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Completed interview not found or unauthorized",
      });
    }

    const existingReport = await reportModel.findOne({
      interview: interview._id,
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "A report already exists for this interview",
      });
    }

    const isValidScore = (score) =>
      typeof score === "number" &&
      Number.isFinite(score) &&
      score >= 0 &&
      score <= 100;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 200 ||
      !isValidScore(overallScore) ||
      !isValidScore(communication) ||
      !isValidScore(problemSolving)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report details or scores",
      });
    }

    if (
      technicalSkills !== undefined &&
      (!Array.isArray(technicalSkills) ||
        technicalSkills.length > 30 ||
        technicalSkills.some(
          (skill) =>
            !skill ||
            typeof skill.name !== "string" ||
            !skill.name.trim() ||
            skill.name.length > 100 ||
            !isValidScore(skill.score)
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid technical skills",
      });
    }

    if (
      strengths !== undefined &&
      (!Array.isArray(strengths) ||
        strengths.length > 30 ||
        strengths.some(
          (item) =>
            typeof item !== "string" ||
            !item.trim() ||
            item.length > 500
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid strengths",
      });
    }

    if (
      areasForImprovement !== undefined &&
      (!Array.isArray(areasForImprovement) ||
        areasForImprovement.length > 30 ||
        areasForImprovement.some(
          (item) =>
            typeof item !== "string" ||
            !item.trim() ||
            item.length > 500
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid improvement areas",
      });
    }

    if (
      aiFeedback !== undefined &&
      (typeof aiFeedback !== "string" ||
        aiFeedback.length > 10000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid AI feedback",
      });
    }

    const report = await reportModel.create({
      interview: interview._id,
      candidate: interview.candidate,
      interviewer: req.user._id,
      title: title.trim(),
      interviewDate: interview.date,
      overallScore,
      communication,
      problemSolving,
      technicalSkills: technicalSkills || [],
      strengths: strengths || [],
      areasForImprovement: areasForImprovement || [],
      aiFeedback: aiFeedback || "",
      status: "completed",
    });

    await interviewModel.findByIdAndUpdate(interview._id, {
      $set: { reportGenerated: true },
    });

    const candidateUser = await userModel.findById(
      interview.candidate
    );

    if (candidateUser?.email) {
      sendReportMail(
        candidateUser.email,
        candidateUser.name,
        report.title,
        report.overallScore,
        report._id
      ).catch((error) => {
        console.error("Report email failed:", error);
      });
    }

    return res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    // MongoDB unique-index protection against concurrent requests.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A report already exists for this interview",
      });
    }

    console.error("Create report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create report",
    });
  }
};

export {
  listAllReports,
  singleReport,
  AddReport,
};
