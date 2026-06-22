import interviewModel from "../models/interviewModel.js";
import reportModel from "../models/reportModel.js";
import billingModel from "../models/BillingModel.js";

const getCandidateDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const upcomingInterviews =
      await interviewModel.countDocuments({
        candidate: userId,
        status: "scheduled",
      });

    const completedInterviews =
      await interviewModel.countDocuments({
        candidate: userId,
        status: "completed",
      });

    const reportsReceived =
      await reportModel.countDocuments({
        candidate: userId,
      });

    const currentPlan =
      (
        await billingModel
          .findOne({
            userId,
            status: "paid",
          })
          .sort({ createdAt: -1 })
      )?.plan || "Free";

    const upcomingList = await interviewModel
      .find({
        candidate: userId,
        status: "scheduled",
      })
      .populate("interviewer", "name")
      .sort({ date: 1 });

    res.json({
      success: true,
      stats: {
        upcomingInterviews,
        completedInterviews,
        reportsReceived,
        currentPlan,
      },
      upcomingList,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getInterviewerDashboard = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const upcomingInterviews =
      await interviewModel.countDocuments({
        interviewer: userId,
        status: "scheduled",
      });

    const completedInterviews =
      await interviewModel.countDocuments({
        interviewer: userId,
        status: "completed",
      });

    const cancelledInterviews =
      await interviewModel.countDocuments({
        interviewer: userId,
        status: "cancelled",
      });

    const completedInterviewList =
      await interviewModel.find({
        interviewer: userId,
        status: "completed",
      });

    const reports = await reportModel.find({
      interviewer: userId,
    });

    const reportInterviewIds = reports.map((r) =>
      r.interview.toString()
    );

    const pendingReports =
      completedInterviewList.filter(
        (interview) =>
          !reportInterviewIds.includes(
            interview._id.toString()
          )
      ).length;

    const upcomingList = await interviewModel
      .find({
        interviewer: userId,
        status: "scheduled",
      })
      .populate("candidate", "name")
      .sort({ date: 1 });

    res.json({
      success: true,
      upcomingInterviews,
      completedInterviews,
      pendingReports,
      cancelledInterviews,
      upcomingList,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export {getCandidateDashboard,getInterviewerDashboard};