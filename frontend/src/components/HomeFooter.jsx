import React from "react";
import logo from "../assets/LOGO.png";

const HomeFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#020817]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">

        {/* Left Side */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="InterviewPro Logo"
            className="h-8 w-8"
          />

          <span className="font-semibold text-white">
            QODE
            <span className="text-purple-500">MEET</span>
          </span>

          <span className="text-sm text-gray-400">
            © 2026
          </span>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">

          {/* Footer Links */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="transition hover:text-white">
              Privacy
            </a>

            <a href="#" className="transition hover:text-white">
              Terms
            </a>

            <a href="#" className="transition hover:text-white">
              Security
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-gray-400">
            <a
              href="#"
              className="transition hover:text-white"
              aria-label="Twitter"
            >
              𝕏
            </a>

            <a
              href="#"
              className="transition hover:text-white"
              aria-label="GitHub"
            >
              GitHub
            </a>

            <a
              href="#"
              className="transition hover:text-white"
              aria-label="LinkedIn"
            >
              in
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;