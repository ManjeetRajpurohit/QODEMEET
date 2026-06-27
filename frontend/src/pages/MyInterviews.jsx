import React, { useContext, useEffect, useState } from "react";
import { CalendarDays, Clock, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/Appcontext.jsx";

const MyInterviews = () => {
  const { token, user, navigate } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("all");
  const [interviews, setInterviews] = useState([]);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/api/interview",
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        setInterviews(response.data.interviews);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const startInterview = async (id) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/interview/start/${id}`,
        {},
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        toast.success("Interview Started");

        navigate(`/interview/${id}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelInterview = async (id) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/interview/cancel/${id}`,
        {},
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        toast.success("Interview cancelled");

        fetchInterviews();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";

      case "started":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";

      case "completed":
        return "bg-green-500/10 text-green-400 border border-green-500/20";

      case "cancelled":
        return "bg-red-500/10 text-red-400 border border-red-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredInterviews =
    activeTab === "all"
      ? interviews
      : interviews.filter((interview) => interview.status === activeTab);

  useEffect(() => {
    if (token) {
      fetchInterviews();
    }
  }, [token]);

  // The list was only ever fetched once on mount, so if the
  // interviewer starts the interview AFTER this page loaded, the
  // candidate kept seeing the stale "scheduled" status - which
  // renders the disabled "Waiting" button instead of the working
  // "Join Interview" button. Poll quietly in the background so the
  // status (and therefore the button) updates on its own.
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchInterviews();
    }, 6000);

    return () => clearInterval(interval);
  }, [token]);
  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">My Interviews</h1>

          <p className="text-gray-400 mt-2">Manage your interviews.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInterviews}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {user?.role === "interviewer" && (
            <button
              onClick={() => navigate("/dashboard/schedule")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium hover:opacity-90 transition"
            >
              <Plus size={18} />
              Schedule Interview
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {["all", "scheduled", "started", "completed", "cancelled"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl transition ${
                activeTab === tab
                  ? "bg-violet-600 text-white"
                  : "bg-[#0B1220] border border-white/10 text-gray-400"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ),
        )}
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-12 text-center">
          <h2 className="text-white text-2xl font-semibold">
            No Interviews Found
          </h2>

          <p className="text-gray-400 mt-3">
            No interviews available in this category.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredInterviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-[#0B1220] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-white text-xl font-semibold">
                    {interview.title}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    {user?.role === "candidate"
                      ? interview.interviewer?.name
                      : interview.candidate?.name}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    interview.status,
                  )}`}
                >
                  {interview.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Candidate</span>

                  <span className="text-white">
                    {interview.candidate?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Interviewer</span>

                  <span className="text-white">
                    {interview.interviewer?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Language</span>

                  <span className="text-white">{interview.language}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>

                  <span className="text-white flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(interview.date)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>

                  <span className="text-white flex items-center gap-2">
                    <Clock size={14} />
                    {interview.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>

                  <span className="text-white">
                    {interview.expectedDuration} min
                  </span>
                </div>
              </div>

              <div className="mt-6">
                {user?.role === "candidate" ? (
                  <>
                    {interview.status === "scheduled" && (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-white/10 text-gray-400 cursor-not-allowed"
                      >
                        Waiting For Interviewer To Start
                      </button>
                    )}

                    {interview.status === "started" && (
                      <button
                        onClick={() => navigate(`/interview/${interview._id}`)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium"
                      >
                        Join Interview
                      </button>
                    )}

                    {interview.status === "completed" && (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 cursor-not-allowed"
                      >
                        Interview Completed
                      </button>
                    )}

                    {interview.status === "cancelled" && (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed"
                      >
                        Interview Cancelled
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex gap-3">
                    {interview.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => startInterview(interview._id)}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium"
                        >
                          Start Interview
                        </button>

                        <button
                          onClick={() => cancelInterview(interview._id)}
                          className="px-5 py-3 rounded-xl bg-red-600 text-white"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {interview.status === "started" && (
                      <button
                        onClick={() => navigate(`/interview/${interview._id}`)}
                        className="w-full py-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      >
                        Interview In Progress
                      </button>
                    )}

                    {interview.status === "completed" && (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20"
                      >
                        Interview Completed
                      </button>
                    )}

                    {interview.status === "cancelled" && (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Interview Cancelled
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInterviews;
