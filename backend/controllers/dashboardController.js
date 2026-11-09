
import interviewModel from "../models/interviewModel.js";
import reportModel from "../models/reportModel.js";
import billingModel from "../models/billingModel.js";

// ==========================================
// CANDIDATE DASHBOARD
// ==========================================

const getCandidateDashboard = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Candidate access only",
      });
    }

    const userId = req.user._id;

    const [
      upcomingInterviews,
      completedInterviews,
      reportsReceived,
      latestBill,
      upcomingList,
    ] = await Promise.all([
      interviewModel.countDocuments({
        candidate: userId,
        status: "scheduled",
      }),

      interviewModel.countDocuments({
        candidate: userId,
        status: "completed",
      }),

      reportModel.countDocuments({
        candidate: userId,
      }),

      billingModel
        .findOne({
          userId,
          status: "paid",
        })
        .sort({ createdAt: -1 })
        .select("plan"),

      interviewModel
        .find({
          candidate: userId,
          status: "scheduled",
        })
        .populate("interviewer", "name")
        .sort({ date: 1 })
        .limit(10),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        upcomingInterviews,
        completedInterviews,
        reportsReceived,
        currentPlan: latestBill?.plan || "Free",
      },
      upcomingList,
    });
  } catch (error) {
    console.error("Candidate dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load candidate dashboard",
    });
  }
};

// ==========================================
// INTERVIEWER DASHBOARD
// ==========================================

const getInterviewerDashboard = async (req, res) => {
  try {
    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        success: false,
        message: "Interviewer access only",
      });
    }

    const userId = req.user._id;

    const [
      upcomingInterviews,
      completedInterviews,
      cancelledInterviews,
      completedInterviewList,
      reports,
      upcomingList,
    ] = await Promise.all([
      interviewModel.countDocuments({
        interviewer: userId,
        status: "scheduled",
      }),

      interviewModel.countDocuments({
        interviewer: userId,
        status: "completed",
      }),

      interviewModel.countDocuments({
        interviewer: userId,
        status: "cancelled",
      }),

      interviewModel
        .find({
          interviewer: userId,
          status: "completed",
        })
        .select("_id")
        .lean(),

      reportModel
        .find({
          interviewer: userId,
        })
        .select("interview")
        .lean(),

      interviewModel
        .find({
          interviewer: userId,
          status: "scheduled",
        })
        .populate("candidate", "name")
        .sort({ date: 1 })
        .limit(10),
    ]);

    const reportInterviewIds = new Set(
      reports.map((report) =>
        report.interview?.toString()
      )
    );

    const pendingReports = completedInterviewList.filter(
      (interview) =>
        !reportInterviewIds.has(interview._id.toString())
    ).length;

    return res.status(200).json({
      success: true,
      upcomingInterviews,
      completedInterviews,
      pendingReports,
      cancelledInterviews,
      upcomingList,
    });
  } catch (error) {
    console.error("Interviewer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load interviewer dashboard",
    });
  }
};

export {
  getCandidateDashboard,
  getInterviewerDashboard,
};
