import reportModel from "../models/reportModel.js";
import interviewModel from "../models/interviewModel.js";
import userModel from "../models/userModel.js";
import sendReportMail from "../utils/sendReportMail.js";

const listAllReports = async (req, res) => {
  try {
    const field =
      req.user.role === "candidate"
        ? "candidate"
        : "interviewer";

    const reports = await reportModel
      .find({
        [field]: req.user._id,
      })
      .populate("candidate", "name email avatar")
      .populate("interviewer", "name email avatar")
      .populate("interview")
      .sort({ interviewDate: -1 });

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const singleReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await reportModel.findOne({
      _id: id,
      $or: [
        { candidate: req.user._id },
        { interviewer: req.user._id },
      ],
    });

    if (!report) {
      return res.json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const AddReport = async (req, res) => {
  try {
    const report = await reportModel.create(req.body);

    if (report.interview) {
      await interviewModel.findByIdAndUpdate(
        report.interview,
        {
          reportGenerated: true,
        }
      );
    }

    // A plain findById here (rather than report.populate()) is
    // deliberate: .populate() mutates the document in place, which
    // would silently turn "candidate" in the response below from an
    // id into an object and break any future caller expecting the
    // original shape.
    const candidateUser = await userModel.findById(report.candidate);

    if (candidateUser?.email) {
      sendReportMail(
        candidateUser.email,
        candidateUser.name,
        report.title,
        report.overallScore,
        report._id,
      ).catch((mailError) => {
        console.log("Failed to send report mail:", mailError);
      });
    }

    return res.json({
      success: true,
      report,
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
  listAllReports,
  singleReport,
  AddReport,
};
