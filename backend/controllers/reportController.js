import reportModel from "../models/reportModel.js";
import interviewModel from "../models/interviewModel.js";

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