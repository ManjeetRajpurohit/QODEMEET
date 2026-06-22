import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/LOGO.png";
import { AppContext } from "../context/Appcontext";

const HomeHeader = () => {
  const { token } = useContext(AppContext);

  return (
    <header className="fixed top-0 left-0 z-50 w-full px-4 pt-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/15 bg-[#050B24]/60 px-6 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10"
          />

          <h1 className="text-3xl font-bold text-white tracking-tight">
            QODE
            <span className="text-purple-500">MEET</span>
          </h1>
        </div>

        {/* Navigation */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          <li>
            <a
              href="#features"
              className="text-gray-400 transition hover:text-white"
            >
              Features
            </a>
          </li>

          <li>
            <a
              href="#pricing"
              className="text-gray-400 transition hover:text-white"
            >
              Pricing
            </a>
          </li>

          <li>
            <a
              href="#customers"
              className="text-gray-400 transition hover:text-white"
            >
              Customers
            </a>
          </li>

          <li>
            <a
              href="#faq"
              className="text-gray-400 transition hover:text-white"
            >
              FAQ
            </a>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <NavLink
            to={token ? "/dashboard" : "/login"}
            className="text-sm font-semibold text-white/90 transition hover:text-purple-400"
          >
            Dashboard
          </NavLink>

          {!token && (
            <>
              <NavLink
                to="/login"
                className="text-sm font-semibold text-white/90 transition hover:text-purple-400"
              >
                Log In
              </NavLink>

              <NavLink
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HomeHeader;