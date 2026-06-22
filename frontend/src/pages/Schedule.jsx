import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";

const Schedule = () => {
  const { navigate, user, token } = useContext(AppContext);

  const [formData, setFormData] = useState({
    title: "",
    candidatemail: "",
    language: "",
    date: "",
    time: "",
    duration: "",
    notes: "",
    selectedQuestions: [],
  });

  const [questions, setQuestions] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/question`,
      );

      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleQuestionToggle = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter((id) => id !== questionId)
        : [...prev.selectedQuestions, questionId],
    }));
  };

  const handleSchedule = async () => {
    try {
      if (
        !formData.title ||
        !formData.candidatemail ||
        !formData.language ||
        !formData.date ||
        !formData.time ||
        !formData.duration
      ) {
        return toast.error("Please fill all required fields");
      }

      if (formData.selectedQuestions.length === 0) {
        return toast.error("Select at least one question");
      }

      if (!user) {
        return toast.error("User not loaded");
      }

      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/get-email`,
        {
          params: {
            email: formData.candidatemail,
          },
        },
      );

      if (!userResponse.data.success) {
        return toast.error("Candidate does not exist");
      }

      const candidateId = userResponse.data.user._id;

      const payload = {
        title: formData.title,
        candidate: candidateId,
        interviewer: user._id,
        language: formData.language,
        questions: formData.selectedQuestions,
        date: formData.date,
        time: formData.time,
        expectedDuration: Number(formData.duration),
        internalNotes: formData.notes,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/interview/schedule`,
        payload,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.limitReached) {
        toast.error(response.data.message);
        navigate("/dashboard/billing");
        return;
      }

      if (response.data.success) {
        toast.success("Interview Scheduled Successfully");
        navigate("/dashboard/interviews");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "Interview limit reached. Upgrade your plan.",
        );

        navigate("/dashboard/billing");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Schedule Interview</h1>

          <p className="text-gray-400 mt-2">
            Create and schedule a new interview.
          </p>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Interview Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Frontend Round"
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Candidate Email
            </label>

            <input
              type="email"
              name="candidatemail"
              value={formData.candidatemail}
              onChange={handleChange}
              placeholder="candidate@gmail.com"
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Programming Language
            </label>

            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="">Select Language</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
              <option value="TypeScript">TypeScript</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-3">
              Select Questions
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              {questions.map((question) => (
                <label
                  key={question._id}
                  className="flex items-center gap-3 bg-[#030712] border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-violet-500 transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedQuestions.includes(question._id)}
                    onChange={() => handleQuestionToggle(question._id)}
                    className="accent-violet-600"
                  />

                  <span className="text-white">{question.title}</span>
                </label>
              ))}
            </div>
            {formData.selectedQuestions.length > 0 && (
              <p className="text-green-400 text-sm mt-3">
                {formData.selectedQuestions.length} question(s) selected
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Time</label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Duration</label>

            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="">Select Duration</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
              <option value="90">90 Minutes</option>
              <option value="120">120 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Internal Notes
            </label>

            <textarea
              rows={5}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add instructions for interviewer..."
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleSchedule}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition"
            >
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
