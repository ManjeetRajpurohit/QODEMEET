import React, { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AppContext } from "../context/Appcontext";

const DashboardLayout = () => {
  const { token, user, loading, navigate } = useContext(AppContext);

  useEffect(() => {
    if (!loading && !token) {
      navigate("/login", { replace: true });
    } else if (!loading && token && !user?.role) {
      navigate("/select-role", { replace: true });
    }
  }, [loading, token, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        Loading your session...
      </div>
    );
  }

  if (!token || !user?.role) return null;

  return (
    <div className="min-h-screen bg-[#030712]">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
