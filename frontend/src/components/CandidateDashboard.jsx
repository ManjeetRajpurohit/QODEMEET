import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bell,
  Handshake,
  User,
  FileText,
  CreditCard,
  LogOut,
} from "lucide-react";
import { AppContext } from "../context/Appcontext.jsx";

const CandidateDashboard = () => {
  const { user, token, backendUrl, navigate, setToken } =
    useContext(AppContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      upcomingInterviews: 0,
      completedInterviews: 0,
      reportsReceived: 0,
      currentPlan: "Free",
    },
    upcomingList: [],
  });

  const menuRef = useRef(null);

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/dashboard/candidate-dashboard`,
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

  return (
    <div className="min-h-screen bg-[#030712] p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="flex flex-row items-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Welcome Back <Handshake size={28} className="shrink-0" />
          </h1>

          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Track your interview preparation and upcoming sessions.
          </p>
        </div>

        <div className="flex items-center gap-5 self-end sm:self-auto">
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
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="text-left hidden sm:block">
                <h3 className="text-white font-semibold">{user?.name}</h3>

                <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full pt-2 w-[88vw] max-w-80 z-50">
                <div className="bg-[#0B1220] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-6 text-center border-b border-white/10">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Upcoming Interviews</p>

          <h2 className="text-4xl font-bold text-white mt-2">
            {dashboardData.stats.upcomingInterviews}
          </h2>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Completed Interviews</p>

          <h2 className="text-4xl font-bold text-white mt-2">
            {dashboardData.stats.completedInterviews}
          </h2>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Reports Received</p>

          <h2 className="text-4xl font-bold text-violet-400 mt-2">
            {dashboardData.stats.reportsReceived}
          </h2>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Current Plan</p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {dashboardData.stats.currentPlan}
          </h2>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">
            Upcoming Interviews
          </h2>
        </div>

        <div className="space-y-4">
          {dashboardData.upcomingList.length > 0 ? (
            dashboardData.upcomingList.map((interview) => (
              <div
                key={interview._id}
                className="border border-white/10 rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white font-medium text-lg">
                    {interview.title}
                  </h3>

                  <p className="text-gray-400 mt-1">
                    Interviewer: {interview.interviewer?.name}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(interview.date).toLocaleDateString()} •{" "}
                    {interview.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-white/10 rounded-xl p-5 text-center text-gray-400">
              No upcoming interviews scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
