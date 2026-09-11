import React from "react";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="bg-[#020817] px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <p className="mb-3 text-sm font-medium text-purple-400">
            Pricing
          </p>

          <h2 className="text-5xl font-bold md:text-6xl">
            Simple plans for every stage
          </h2>

          <p className="mt-5 text-lg text-gray-400">
            Start free and upgrade as your interview volume grows.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-20 grid gap-8 lg:grid-cols-4">
          {/* Free */}
          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold">Free</h3>

            <p className="mt-2 text-gray-400">
              Perfect for getting started.
            </p>

            <div className="mt-8">
              <span className="text-6xl font-bold">₹0</span>
              <span className="text-gray-400"> /month</span>
            </div>

            <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold">
              Start Free
            </button>

            <ul className="mt-8 space-y-4">
              {[
                "1 Interview / Month",
                "Interview Scheduling",
                "Question Bank Access",
                "Interview Reports",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-8 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#020817] px-4 py-1 text-sm font-semibold">
              Most Popular
            </div>

            <h3 className="text-3xl font-bold">Pro</h3>

            <p className="mt-2 text-white/80">
              For active interviewers.
            </p>

            <div className="mt-8">
              <span className="text-6xl font-bold">₹9</span>
              <span className="text-white/80"> /month</span>
            </div>

            <button className="mt-8 w-full rounded-xl bg-[#020817] py-3 font-semibold">
              Upgrade to Pro
            </button>

            <ul className="mt-8 space-y-4">
              {[
                "15 Interviews / Month",
                "Interview Scheduling",
                "Question Bank",
                "Interview Reports",
                "Email Notifications",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold">Enterprise</h3>

            <p className="mt-2 text-gray-400">
              For teams handling high interview volume.
            </p>

            <div className="mt-8">
              <span className="text-6xl font-bold">₹29</span>
              <span className="text-gray-400"> /month</span>
            </div>

            <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold">
              Choose Enterprise
            </button>

            <ul className="mt-8 space-y-4">
              {[
                "Unlimited Interviews",
                "Question Bank",
                "Interview Reports",
                "Email Notifications",
                "Priority Access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Annual */}
          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold">Annual</h3>

            <p className="mt-2 text-gray-400">
              Best value for long-term usage.
            </p>

            <div className="mt-8">
              <span className="text-6xl font-bold">₹99</span>
              <span className="text-gray-400"> /year</span>
            </div>

            <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold">
              Get Annual Plan
            </button>

            <ul className="mt-8 space-y-4">
              {[
                "Unlimited Interviews",
                "1 Year Access",
                "Question Bank",
                "Interview Reports",
                "Email Notifications",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;