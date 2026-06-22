import React from "react";
import {
  Video,
  Code2,
  MessageSquare,
  FileText,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Interview Room",
    description:
      "Conduct technical interviews in a dedicated workspace built for candidates and interviewers.",
  },
  {
    icon: Code2,
    title: "Code Editor",
    description:
      "Built-in coding environment for solving programming problems during technical interviews.",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description:
      "Communicate instantly with candidates through real-time interview chat.",
  },
  {
    icon: FileText,
    title: "Interview Reports",
    description:
      "Create structured feedback and evaluation reports after every interview.",
  },
  {
    icon: Users,
    title: "Question Bank",
    description:
      "Manage and organize technical questions for different interview rounds and skill levels.",
  },
  {
    icon: Zap,
    title: "Interview Scheduling",
    description:
      "Schedule interviews, notify candidates by email, and manage upcoming interview sessions.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="relative bg-[#020817] px-6 py-32 text-white"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <p className="mb-4 text-sm font-medium text-purple-400">
            Everything in one platform
          </p>

          <h2 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
            Manage technical interviews
            <br />
            from start to finish
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Schedule interviews, manage candidates, conduct coding rounds,
            maintain question banks, and generate detailed interview reports
            from one centralized platform.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-[#050B24]/50 p-8 backdrop-blur-sm transition duration-300 hover:border-purple-500/30 hover:bg-white/[0.03]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Icon size={22} />
                </div>

                <h3 className="mb-3 text-2xl font-semibold">
                  {feature.title}
                </h3>

                <p className="leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;