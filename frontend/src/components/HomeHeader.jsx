import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/LOGO.png";
import { AppContext } from "../context/Appcontext";

const HomeHeader = () => {
  const { token } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#customers", label: "Customers" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full px-4 pt-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/15 bg-[#050B24]/60 px-4 sm:px-6 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 sm:h-10 sm:w-10"
          />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            QODE
            <span className="text-purple-500">MEET</span>
          </h1>
        </div>

        {/* Navigation - desktop only */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-gray-400 transition hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions - desktop only */}
        <div className="hidden md:flex items-center gap-5">
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

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-1"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden mx-auto mt-2 max-w-6xl rounded-2xl border border-white/15 bg-[#050B24]/95 px-6 py-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 transition hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-white/10">
            <NavLink
              to={token ? "/dashboard" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-white/90"
            >
              Dashboard
            </NavLink>

            {!token && (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-white/90"
                >
                  Log In
                </NavLink>

                <NavLink
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white text-center"
                >
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
