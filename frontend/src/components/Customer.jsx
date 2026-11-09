import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Manager",
    company: "Linear",
    review:
      "InterviewPro completely transformed our hiring process. The collaborative IDE and structured scorecards save us hours every week.",
  },
  {
    name: "David Kim",
    role: "Head of Talent",
    company: "Vercel",
    review:
      "The best technical interviewing platform we've used. Video, coding, and feedback all in one place.",
  },
  {
    name: "Priya Sharma",
    role: "Tech Recruiter",
    company: "Razorpay",
    review:
      "Candidates love the experience and interviewers finally have consistent evaluation criteria.",
  },
];

const Customer = () => {
  return (
    <section
      id="customers"
      className="bg-[#020817] px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="text-center">
          <p className="mb-3 text-sm font-medium text-purple-400">
            Customers
          </p>

          <h2 className="text-5xl font-bold md:text-6xl">
            Loved by hiring teams
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Thousands of interviews conducted every month by startups,
            scale-ups, and enterprise teams.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 text-center">
            <h3 className="text-4xl font-bold text-purple-400">10k+</h3>
            <p className="mt-2 text-gray-400">Interviews Conducted</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 text-center">
            <h3 className="text-4xl font-bold text-purple-400">500+</h3>
            <p className="mt-2 text-gray-400">Hiring Teams</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 text-center">
            <h3 className="text-4xl font-bold text-purple-400">98%</h3>
            <p className="mt-2 text-gray-400">Customer Satisfaction</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 text-center">
            <h3 className="text-4xl font-bold text-purple-400">30+</h3>
            <p className="mt-2 text-gray-400">Supported Languages</p>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 backdrop-blur-sm"
            >
              <div className="mb-5 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill="currentColor"
                    className="text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed">
                "{item.review}"
              </p>

              <div className="mt-8">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-gray-400 text-sm">
                  {item.role} · {item.company}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Customer;