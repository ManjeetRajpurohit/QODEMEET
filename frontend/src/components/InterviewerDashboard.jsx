import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bell,
  Plus,
  CalendarDays,
  FileText,
  XCircle,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";
import { AppContext } from "../context/Appcontext.jsx";

const InterviewerDashboard = () => {
  const { navigate, user, loading, token, backendUrl, setToken } =
    useContext(AppContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: 0,
    completedInterviews: 0,
    pendingReports: 0,
    cancelledInterviews: 0,
    upcomingList: [],
  });

  const menuRef = useRef(null);

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dashboard/interviewer-dashboard`,
        {
          headers: {
            token,
          },
        },
      );

      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    if (setToken) {
      setToken("");
    }

    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      getDashboardData();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Welcome Back</h1>

          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Manage interviews and candidate evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <button
            onClick={() => navigate("/dashboard/schedule")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium hover:opacity-90 transition"
          >
            <Plus size={18} />
            Schedule Interview
          </button>
          <div
            className="relative"
            ref={menuRef}
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block">
                <h3 className="text-white font-semibold">{user?.name}</h3>

                <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1 w-[88vw] max-w-80 bg-[#0B1220] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden">
                <div className="p-6 text-center border-b border-white/10">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <h3 className="text-white font-semibold text-lg mt-4">
                    {user?.name}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">{user?.email}</p>

                  <p className="text-violet-400 text-sm capitalize mt-1">
                    {user?.role}
                  </p>

                  <button
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setShowProfileMenu(false);
                    }}
                    className="mt-5 w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition"
                  >
                    Manage Profile
                  </button>
                </div>

                <div className="p-3">
                  <button
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <User size={18} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/dashboard/reports");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <FileText size={18} />
                    Reports
                  </button>

                  <button
                    onClick={() => {
                      navigate("/dashboard/billing");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <CreditCard size={18} />
                    Billing
                  </button>

                  <div className="border-t border-white/10 my-2"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#071225] border border-white/10 rounded-3xl p-6">
          <CalendarDays className="text-violet-400" size={22} />

          <p className="text-gray-400 text-sm mt-4">Upcoming Interviews</p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
            {dashboardData.upcomingInterviews}
          </h2>
        </div>

        <div className="bg-[#071225] border border-white/10 rounded-3xl p-6">
          <CalendarDays className="text-green-400" size={22} />

          <p className="text-gray-400 text-sm mt-4">Completed Interviews</p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
            {dashboardData.completedInterviews}
          </h2>
        </div>

        <div className="bg-[#071225] border border-white/10 rounded-3xl p-6">
          <FileText className="text-yellow-400" size={22} />

          <p className="text-gray-400 text-sm mt-4">Pending Reports</p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mt-2">
            {dashboardData.pendingReports}
          </h2>
        </div>

        <div className="bg-[#071225] border border-white/10 rounded-3xl p-6">
          <XCircle className="text-red-400" size={22} />

          <p className="text-gray-400 text-sm mt-4">Cancelled Interviews</p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">
            {dashboardData.cancelledInterviews}
          </h2>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-[#071225] border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upcoming Interviews</h2>

          <button
            onClick={() => navigate("/dashboard/interviews")}
            className="text-violet-400 hover:text-violet-300 transition"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {dashboardData.upcomingList?.length > 0 ? (
            dashboardData.upcomingList.map((interview) => (
              <div
                key={interview._id}
                className="border border-white/10 rounded-2xl p-5 bg-[#050F1F]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {interview.title}
                    </h3>

                    <p className="text-gray-400 mt-1">
                      Candidate: {interview.candidate?.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(interview.date).toLocaleDateString()} •{" "}
                      {interview.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-white/10 rounded-2xl p-5 bg-[#050F1F] text-center text-gray-400">
              No upcoming interviews scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
