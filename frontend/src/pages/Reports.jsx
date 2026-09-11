import React, { useContext, useEffect, useState } from "react";
import { FileText, Calendar, Clock, ChevronRight } from "lucide-react";
import { AppContext } from "../context/Appcontext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Reports = () => {
  const { navigate, user, token } = useContext(AppContext);

  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/report`,
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/interview/completed`,
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        const pending = response.data.interviews.filter(
          (interview) => !interview.reportGenerated
        );

        setPendingReports(pending);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
      fetchPendingReports();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Interview Reports
          </h1>

          <p className="text-gray-400 mt-2">
            View all your completed interview scorecards.
          </p>
        </div>

        {user?.role === "interviewer" && (
          <button
            onClick={() => navigate("/dashboard/add-report")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium hover:opacity-90 transition"
          >
            Add Report
          </button>
        )}
      </div>

      {pendingReports.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-5">
            Pending Reports
          </h2>

          <div className="space-y-5">
            {pendingReports.map((interview) => (
              <div
                key={interview._id}
                className="bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {interview.title}
                    </h3>

                    <p className="text-gray-400 mt-2">
                      {user?.role === "candidate"
                        ? `Interviewer: ${interview.interviewer?.name}`
                        : `Candidate: ${interview.candidate?.name}`}
                    </p>
                  </div>

                  {user?.role === "interviewer" ? (
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/add-report/${interview._id}`
                        )
                      }
                      className="px-5 py-3 rounded-xl bg-yellow-500 text-black font-medium"
                    >
                      Add Report
                    </button>
                  ) : (
                    <div className="px-5 py-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Report Pending
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-white mb-5">
        Available Reports
      </h2>

      <div className="space-y-5">
        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="text-violet-400" size={22} />

                  <h2 className="text-xl font-semibold text-white">
                    {report.title}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(
                      report.interviewDate
                    ).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {new Date(
                      report.interviewDate
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center mr-2">
                  <p className="text-gray-400 text-sm">
                    Overall Score
                  </p>

                  <h3 className="text-3xl font-bold text-violet-400">
                    {report.overallScore}
                  </h3>
                </div>

                <button
                  onClick={() =>
                    navigate(`/dashboard/reports/${report._id}`)
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium hover:opacity-90 transition"
                >
                  View Report
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && pendingReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <FileText size={60} className="text-gray-600 mb-4" />

          <h2 className="text-xl font-semibold text-white">
            No Reports Found
          </h2>

          <p className="text-gray-400 mt-2">
            Complete an interview to see your reports here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;