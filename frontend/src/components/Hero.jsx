import React, { useContext } from "react";
import { AppContext } from "../context/Appcontext.jsx";
const Hero = () => {
  const {navigate}=useContext(AppContext);
  return (
    <section className="relative overflow-x-hidden bg-[#020817] pb-24">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0
          bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),
          linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
          bg-[size:56px_56px]"
        />

        {/* Blue Glow */}
        <div className="absolute left-[-250px] top-[-100px] h-[700px] w-[700px] rounded-full bg-indigo-600/20 blur-[180px]" />

        {/* Purple Glow */}
        <div className="absolute right-[-250px] top-[100px] h-[700px] w-[700px] rounded-full bg-purple-600/20 blur-[180px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-20 text-center">
        {/* Badge */}
        <div className="mb-8 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-gray-300 backdrop-blur-md">
          New — Role-based interview management for candidates and interviewers
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl text-5xl font-bold leading-tight text-white md:text-7xl">
          Schedule, manage and
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            conduct technical interviews.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-400">
          InterviewPro helps interviewers schedule interviews, manage question
          banks, conduct coding assessments, track candidates, and generate
          structured interview reports from one centralized platform.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button 
          onClick={()=>navigate("/login")}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 font-semibold text-white transition hover:scale-105">
            Start Free Plan
          </button>

          <a href="#features" className="rounded-xl border border-white/10 bg-[#050B24] px-8 py-4 font-semibold text-white transition hover:bg-white/5">
            Explore Features
          </a>
        </div>

        {/* Small Text */}
        <p className="mt-4 text-sm text-gray-500">
          Free plan available. Upgrade anytime as your hiring grows.
        </p>

        {/* Preview Card */}
        <div className="mt-20 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#050B24]/80 shadow-[0_0_80px_rgba(99,102,241,0.15)]">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>

            <p className="text-sm text-gray-400">
              interview / frontend-round · two-sum.py
            </p>

            <div className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-400">
              ● LIVE
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row">
            {/* Code Editor */}
            <div className="flex-1 p-8">
              <pre className="overflow-auto text-left text-sm text-indigo-300">
{`# Two Sum — find indices that sum to target

def two_sum(nums, target):
    seen = {}

    for i, n in enumerate(nums):
        complement = target - n

        if complement in seen:
            return [seen[complement], i]

        seen[n] = i`}
              </pre>

              <div className="mt-8 rounded-xl border border-white/10 p-4 text-green-400">
                Question assigned successfully • Interview in progress
              </div>
            </div>

            {/* Interview Panel */}
            <div className="w-full border-t border-white/10 p-6 md:w-80 md:border-l md:border-t-0">
              <div className="mb-5 rounded-xl border border-white/10 p-2">
                <div className="h-28 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                <div className="mt-2 flex justify-between text-sm text-white">
                  <span>Candidate</span>
                  <span className="text-gray-400">Interviewee</span>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-white/10 p-2">
                <div className="h-28 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500"></div>
                <div className="mt-2 flex justify-between text-sm text-white">
                  <span>Interviewer</span>
                  <span className="text-gray-400">Host</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-4 text-left text-sm text-gray-300">
                Please explain your approach before implementing the solution.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-14 text-center text-sm text-gray-500">
          Built for candidates, interviewers and growing hiring teams.
        </div>
      </div>
    </section>
  );
};

export default Hero;