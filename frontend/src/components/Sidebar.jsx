import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  CreditCard,
  LogOut,
  PlusCircle,
  FileText,
  CircleQuestionMark,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/Appcontext";
const Sidebar = () => {
  const { user } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  let navItems = [];

  if (user?.role === "candidate") {
    navItems = [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        name: "My Interviews",
        icon: CalendarDays,
        path: "/dashboard/interviews",
      },
      {
        name: "Reports",
        icon: FileText,
        path: "/dashboard/reports",
      },
      {
        name: "Profile",
        icon: User,
        path: "/dashboard/profile",
      },
      {
        name: "Billing",
        icon: CreditCard,
        path: "/dashboard/billing",
      },
    ];
  } else {
    navItems = [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        name: "Schedule Interview",
        icon: PlusCircle,
        path: "/dashboard/schedule",
      },
      {
        name: "My Interviews",
        icon: CalendarDays,
        path: "/dashboard/interviews",
      },
      {
        name: "Profile",
        icon: User,
        path: "/dashboard/profile",
      },
      {
        name: "Billing",
        icon: CreditCard,
        path: "/dashboard/billing",
      },
      {
        name: "Questions",
        icon: CircleQuestionMark,
        path: "/dashboard/questions",
      },
      {
        name: "Reports",
        icon: FileText,
        path: "/dashboard/reports",
      },
    ];
  }
  const {navigate} =useContext(AppContext)
  const handleLogout=()=>{
      localStorage.removeItem("token");
      navigate('/login');
  }

  return (
    <>
      {/* Mobile hamburger - hidden on desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#050B1D] border border-white/10 flex items-center justify-center text-white"
      >
        <Menu size={20} />
      </button>

      {/* Mobile backdrop - tap to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#050B1D] border-r border-white/10 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div>
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-xl">
                InterviewPro
              </h1>

              <p className="text-xs text-gray-400 mt-1">
                Interview Platform
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button  onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
