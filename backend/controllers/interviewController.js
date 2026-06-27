import interviewModel from "../models/interviewModel.js";
import {
  sendInterviewStartedMail,
  sendInterviewScheduledMail,
  sendInterviewEndedMail,
  sendInterviewCancelledMail,
} from "../utils/sendInterviewMail.js";
import userModel from "../models/userModel.js";
const schedule = async (req, res) => {
  try {
    const {
      title,
      candidate,
      interviewer,
      language,
      questions,
      date,
      time,
      expectedDuration,
      internalNotes,
    } = req.body;

    if (!questions || questions.length === 0) {
      return res.json({
        success: false,
        message: "Select Atleast One Question",
      });
    }

    const currentUser = await userModel.findById(req.user._id);

    if (!currentUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    // Reset monthly usage
    if (
      currentUser.billingCycleStart &&
      now - currentUser.billingCycleStart >= 30 * 24 * 60 * 60 * 1000
    ) {
      currentUser.interviewsUsed = 0;
      currentUser.billingCycleStart = now;
      await currentUser.save();
    }

    // Activate upcoming plan if current expired
    if (
      currentUser.subscriptionExpiry &&
      currentUser.subscriptionExpiry < now
    ) {
      if (currentUser.upcomingPlan) {
        currentUser.subscriptionPlan = currentUser.upcomingPlan;

        currentUser.subscriptionExpiry = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        currentUser.upcomingPlan = null;
        currentUser.upcomingPlanExpiry = null;
      } else {
        currentUser.subscriptionPlan = "Free";
        currentUser.subscriptionExpiry = null;
      }

      currentUser.interviewsUsed = 0;
      currentUser.billingCycleStart = now;

      await currentUser.save();
    }

    // Plan Limits
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

    const inter = new interviewModel({
      title,
      candidate,
      interviewer,
      language,
      questions,
      date,
      time,
      expectedDuration,
      internalNotes,
    });

    await inter.save();

    currentUser.interviewsUsed += 1;
    await currentUser.save();

    const candidateUser = await userModel.findById(candidate);
    const interviewerUser = await userModel.findById(interviewer);

    // Mail failures must NEVER fail this request - the interview is
    // already saved at this point. A bad SMTP credential or a flaky
    // network blip on the mail send used to bubble up into the outer
    // catch below and report "failed" to the interviewer even though
    // the interview had already been created.
    try {
      await sendInterviewScheduledMail(
        candidateUser.email,
        candidateUser.name,
        title,
        interviewerUser.name,
        date,
        time,
        expectedDuration,
        language,
      );
    } catch (mailError) {
      console.log("Failed to send schedule mail:", mailError);
    }

    return res.json({
      success: true,
      interview: inter,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const getMyInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const field = req.user.role === "candidate" ? "candidate" : "interviewer";

    const interviews = await interviewModel
      .find({ [field]: userId })
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar");

    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
const getCompletedInterviews = async (req, res) => {
  try {
    const field = req.user.role === "candidate" ? "candidate" : "interviewer";

    const interviews = await interviewModel
      .find({
        [field]: req.user._id,
        status: "completed",
      })
      .populate("candidate", "name email")
      .populate("interviewer", "name email");

    return res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await interviewModel
      .findByIdAndUpdate(
        id,
        {
          status: "cancelled",
        },
        { new: true },
      )
      .populate("candidate", "name email");

    if (!interview) {
      return res.json({
        success: false,
        message: "Interview not found",
      });
    }

    try {
      await sendInterviewCancelledMail(
        interview.candidate.email,
        interview.candidate.name,
        interview.title,
      );
    } catch (mailError) {
      console.log("Failed to send cancellation mail:", mailError);
    }

    return res.json({
      success: true,
      message: "Interview cancelled successfully",
      interview,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const getSingleInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await interviewModel
      .findById(id)
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar")
      .populate("questions");

    if (!interview) {
      return res.json({
        success: false,
        message: "Interview not found",
      });
    }

    const isCandidate =
      interview.candidate._id.toString() === req.user._id.toString();

    const isInterviewer =
      interview.interviewer._id.toString() === req.user._id.toString();

    if (!isCandidate && !isInterviewer) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const endInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await interviewModel
      .findById(id)
      .populate("candidate", "name email");

    if (!interview) {
      return res.json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "completed";
    interview.endedAt = new Date();

    await interview.save();

    try {
      await sendInterviewEndedMail(
        interview.candidate.email,
        interview.candidate.name,
        interview.title,
      );
    } catch (mailError) {
      console.log("Failed to send end-of-interview mail:", mailError);
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const startInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await interviewModel
      .findById(id)
      .populate("candidate", "name email");

    if (!interview) {
      return res.json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "started";
    interview.startedAt = new Date();

    await interview.save();

    try {
      await sendInterviewStartedMail(
        interview.candidate.email,
        interview.candidate.name,
        interview.title,
        interview._id,
      );
    } catch (mailError) {
      console.log("Failed to send interview-started mail:", mailError);
    }

    return res.json({
      success: true,
      message: "Interview started",
      interview,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  schedule,
  getMyInterviews,
  getCompletedInterviews,
  cancelInterview,
  getSingleInterview,
  endInterview,
  startInterview,
};
