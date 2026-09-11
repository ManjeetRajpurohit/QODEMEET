import React, { useState } from "react";

const faqData = [
  {
    question: "How does the Free plan work?",
    answer:
      "The Free plan allows you to schedule 1 interview per month at no cost. You can access interview scheduling, question management, and interview reports.",
  },
  {
    question: "What is included in the Pro plan?",
    answer:
      "The Pro plan allows up to 15 interviews per month and includes everything available in the Free plan, making it ideal for recruiters and frequent interviewers.",
  },
  {
    question: "What is included in Enterprise and Annual plans?",
    answer:
      "Enterprise and Annual plans provide unlimited interviews along with access to all InterviewPro features including scheduling, question banks, reports, and email notifications.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are securely processed through Razorpay. After a successful payment, your subscription is activated automatically and billing records are available from your billing dashboard.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes. You can upgrade your subscription at any time from the Billing page. If you already have an active paid plan, the newly purchased plan will be queued and activated automatically after your current plan expires.",
  },
  {
    question: "What features does InterviewPro provide?",
    answer:
      "InterviewPro includes interview scheduling, candidate management, question banks, coding interview rooms, interview reports, billing management, email notifications, and role-based access for candidates and interviewers.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. InterviewPro uses secure authentication with JWT and Google OAuth, role-based access control, protected API routes, and securely stored user, interview, report, and billing data.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="bg-[#020817] px-6 py-28 text-white"
    >
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-purple-400">
            FAQ
          </p>

          <h2 className="text-5xl font-bold md:text-6xl">
            Questions, answered
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-5">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#050B24]/50 backdrop-blur-sm transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between px-6 py-6 text-left"
              >
                <span className="text-xl font-semibold">
                  {faq.question}
                </span>

                <span className="text-2xl text-purple-400">
                  {activeIndex === index ? "×" : "+"}
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  activeIndex === index
                    ? "max-h-40 px-6 pb-6 opacity-100"
                    : "max-h-0 px-6 opacity-0"
                }`}
              >
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;