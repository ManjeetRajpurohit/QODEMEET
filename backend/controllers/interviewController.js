import mongoose from "mongoose";

import interviewModel from "../models/interviewModel.js";

import {
  sendInterviewStartedMail,
  sendInterviewScheduledMail,
  sendInterviewEndedMail,
  sendInterviewCancelledMail,
} from "../utils/sendInterviewMail.js";

import userModel from "../models/userModel.js";

// Never expose interviewer-only notes to candidates.
const serializeInterviewForUser = (interview, includeInternalNotes) => {
  const interviewData = interview.toObject();

  if (!includeInternalNotes) {
    delete interviewData.internalNotes;
  }

  return interviewData;
};

// ==========================================
// SCHEDULE INTERVIEW
// ==========================================

const schedule = async (req, res) => {
  try {
    const {
      title,
      candidate,
      language,
      questions,
      date,
      time,
      expectedDuration,
      internalNotes,
    } = req.body;

    const interviewer = req.user._id;

    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Only interviewers can schedule interviews",
      });
    }

    if (
      !title ||
      !candidate ||
      !language ||
      !date ||
      !time ||
      !expectedDuration
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(candidate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one question",
      });
    }

    const currentUser = await userModel.findById(interviewer);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Interviewer not found",
      });
    }

    const candidateForCheck = await userModel.findById(candidate);

    if (!candidateForCheck) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidateForCheck.role !== "candidate") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a candidate",
      });
    }

    if (!candidateForCheck.isVerified) {
      return res.status(403).json({
        success: false,
        notVerified: true,
        message: "This candidate hasn't verified their account yet",
      });
    }

    const now = new Date();

    // Reset monthly usage.
    if (
      currentUser.billingCycleStart &&
      now - currentUser.billingCycleStart >=
        30 * 24 * 60 * 60 * 1000
    ) {
      currentUser.interviewsUsed = 0;
      currentUser.billingCycleStart = now;
    }

    // Activate upcoming plan if current subscription expired.
    if (
      currentUser.subscriptionExpiry &&
      currentUser.subscriptionExpiry < now
    ) {
      if (currentUser.upcomingPlan) {
        currentUser.subscriptionPlan = currentUser.upcomingPlan;

        currentUser.subscriptionExpiry = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        currentUser.upcomingPlan = null;
        currentUser.upcomingPlanExpiry = null;
      } else {
        currentUser.subscriptionPlan = "Free";
        currentUser.subscriptionExpiry = null;
      }

      currentUser.interviewsUsed = 0;
      currentUser.billingCycleStart = now;
    }

    // Plan limits.
    if (
      currentUser.subscriptionPlan === "Free" &&
      currentUser.interviewsUsed >= 1
    ) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: "Free plan limit reached. Upgrade your plan.",
      });
    }

    if (
      currentUser.subscriptionPlan === "Pro" &&
      currentUser.interviewsUsed >= 15
    ) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: "Pro plan limit reached. Upgrade your plan.",
      });
    }

    const interview = new interviewModel({
      title,
      candidate: candidateForCheck._id,
      interviewer: currentUser._id,
      language,
      questions,
      date,
      time,
      expectedDuration,
      internalNotes,
    });

    await interview.save();

    currentUser.interviewsUsed =
      (currentUser.interviewsUsed || 0) + 1;

    await currentUser.save();

    // Email failures must not fail an already-created interview.
    sendInterviewScheduledMail(
      candidateForCheck.email,
      candidateForCheck.name,
      title,
      "Interviewer",
      currentUser.name,
      date,
      time,
      expectedDuration,
      language
    ).catch((error) => {
      console.error("Candidate schedule email failed:", error);
    });

    sendInterviewScheduledMail(
      currentUser.email,
      currentUser.name,
      title,
      "Candidate",
      candidateForCheck.name,
      date,
      time,
      expectedDuration,
      language
    ).catch((error) => {
      console.error("Interviewer schedule email failed:", error);
    });

    return res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule interview",
    });
  }
};

// ==========================================
// GET MY INTERVIEWS
// ==========================================

const getMyInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!["candidate", "interviewer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    const field =
      req.user.role === "candidate"
        ? "candidate"
        : "interviewer";

    const interviews = await interviewModel
      .find({ [field]: userId })
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar")
      .sort({ createdAt: -1 });

    const includeInternalNotes = req.user.role === "interviewer";

    const safeInterviews = interviews.map((interview) =>
      serializeInterviewForUser(interview, includeInternalNotes)
    );

    return res.status(200).json({
      success: true,
      interviews: safeInterviews,
    });
  } catch (error) {
    console.error("Get my interviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interviews",
    });
  }
};
// ==========================================
// GET COMPLETED INTERVIEWS
// ==========================================

const getCompletedInterviews = async (req, res) => {
  try {
    if (!["candidate", "interviewer"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    const field =
      req.user.role === "candidate"
        ? "candidate"
        : "interviewer";

    const interviews = await interviewModel
      .find({
        [field]: req.user._id,
        status: "completed",
      })
      .populate("candidate", "name email")
      .populate("interviewer", "name email")
      .sort({ createdAt: -1 });

    const includeInternalNotes = req.user.role === "interviewer";

    const safeInterviews = interviews.map((interview) =>
      serializeInterviewForUser(interview, includeInternalNotes)
    );

    return res.status(200).json({
      success: true,
      interviews: safeInterviews,
    });
  } catch (error) {
    console.error("Get completed interviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve completed interviews",
    });
  }
};

// ==========================================
// CANCEL INTERVIEW
// ==========================================

const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Only interviewers can cancel interviews",
      });
    }

    const interview = await interviewModel
      .findOneAndUpdate(
        {
          _id: id,
          interviewer: req.user._id,
          status: { $in: ["scheduled", "started"] },
        },
        {
          $set: {
            status: "cancelled",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate("candidate", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found, unauthorized, or already finished",
      });
    }

    sendInterviewCancelledMail(
      interview.candidate.email,
      interview.candidate.name,
      interview.title
    ).catch((error) => {
      console.error("Cancellation email failed:", error);
    });

    return res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
      interview,
    });
  } catch (error) {
    console.error("Cancel interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel interview",
    });
  }
};

// ==========================================
// GET SINGLE INTERVIEW
// ==========================================

const getSingleInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await interviewModel
      .findById(id)
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar")
      .populate("questions");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const userId = req.user._id.toString();

    const isCandidate =
      interview.candidate?._id?.toString() === userId;

    const isInterviewer =
      interview.interviewer?._id?.toString() === userId;

    if (!isCandidate && !isInterviewer) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this interview",
      });
    }

    const safeInterview = serializeInterviewForUser(
      interview,
      isInterviewer
    );

    return res.status(200).json({
      success: true,
      interview: safeInterview,
    });
  } catch (error) {
    console.error("Get single interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview",
    });
  }
};// ==========================================
// END INTERVIEW
// ==========================================

const endInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Only interviewers can end interviews",
      });
    }

    const interview = await interviewModel
      .findOneAndUpdate(
        {
          _id: id,
          interviewer: req.user._id,
          status: "started",
        },
        {
          $set: {
            status: "completed",
            endedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate("candidate", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found, unauthorized, or not started",
      });
    }

    sendInterviewEndedMail(
      interview.candidate.email,
      interview.candidate.name,
      interview.title
    ).catch((error) => {
      console.error("End interview email failed:", error);
    });

    return res.status(200).json({
      success: true,
      message: "Interview ended successfully",
      interview,
    });
  } catch (error) {
    console.error("End interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to end interview",
    });
  }
};

// ==========================================
// START INTERVIEW
// ==========================================

const startInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Only interviewers can start interviews",
      });
    }

    const interview = await interviewModel
      .findOneAndUpdate(
        {
          _id: id,
          interviewer: req.user._id,
          status: "scheduled",
        },
        {
          $set: {
            status: "started",
            startedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .populate("candidate", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found, unauthorized, or already started",
      });
    }

    sendInterviewStartedMail(
      interview.candidate.email,
      interview.candidate.name,
      interview.title,
      interview._id
    ).catch((error) => {
      console.error("Interview start email failed:", error);
    });

    return res.status(200).json({
      success: true,
      message: "Interview started successfully",
      interview,
    });
  } catch (error) {
    console.error("Start interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start interview",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  schedule,
  getMyInterviews,
  getCompletedInterviews,
  cancelInterview,
  getSingleInterview,
  endInterview,
  startInterview,
};