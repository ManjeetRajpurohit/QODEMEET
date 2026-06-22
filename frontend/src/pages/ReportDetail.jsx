import React, { useContext, useEffect, useState } from "react";
import { ArrowLeft, Award, Brain, MessageSquare, Code } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/Appcontext.jsx";
import { toast } from "react-toastify";

const ReportDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useContext(AppContext);

  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/${id}`,
        {
          headers: { token },
        },
      );

      console.log(response.data);

      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [token, id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <button
        onClick={() => navigate("/dashboard/reports")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
      >
        <ArrowLeft size={18} />
        Back to Reports
      </button>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-gray-400 mb-2">Interview Report</p>

            <h1 className="text-3xl font-bold text-white">{report.title}</h1>

            <p className="text-gray-400 mt-2">
              {new Date(report.interviewDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">Overall Score</p>

            <h2 className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              {report.overallScore}
            </h2>

            <p className="text-gray-400 mt-1">out of 100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-violet-400" size={22} />
            <h3 className="text-white font-semibold">Communication</h3>
          </div>

          <p className="text-4xl font-bold text-white">
            {report.communication}/100
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-violet-400" size={22} />
            <h3 className="text-white font-semibold">Problem Solving</h3>
          </div>

          <p className="text-4xl font-bold text-white">
            {report.problemSolving}/100
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-violet-400" size={22} />
            <h3 className="text-white font-semibold">Overall Rating</h3>
          </div>

          <p className="text-4xl font-bold text-white">
            {report.overallScore}/100
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Code className="text-violet-400" size={24} />

          <h2 className="text-2xl font-bold text-white">Technical Skills</h2>
        </div>

        <div className="space-y-5">
          {(report.technicalSkills || []).map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-white mb-2">
                <span>{item.name}</span>
                <span>{item.score}/100</span>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                  style={{
                    width: `${item.score}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-green-400 mb-5">Strengths</h2>

          <ul className="space-y-3">
            {(report.strengths || []).map((item, index) => (
              <li key={index} className="text-gray-300">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-red-400 mb-5">
            Areas For Improvement
          </h2>

          <ul className="space-y-3">
            {(report.areasForImprovement || []).map((item, index) => (
              <li key={index} className="text-gray-300">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-5">
          AI Interview Feedback
        </h2>

        <p className="text-gray-300 leading-8">{report.aiFeedback}</p>
      </div>
    </div>
  );
};

export default ReportDetail;
