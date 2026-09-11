import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext.jsx";

const AddReport = () => {
  const { token, navigate } = useContext(AppContext);

  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [formData, setFormData] = useState({
    overallScore: "",
    communication: "",
    problemSolving: "",
    aiFeedback: "",
    strengths: "",
    areasForImprovement: "",
    technicalSkills: [{ name: "", score: "" }],
  });

  const fetchCompletedInterviews = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/interview/completed`,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        setInterviews(response.data.interviews);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompletedInterviews();
    }
  }, [token]);

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.technicalSkills];

    updatedSkills[index][field] = value;

    setFormData({
      ...formData,
      technicalSkills: updatedSkills,
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      technicalSkills: [
        ...formData.technicalSkills,
        {
          name: "",
          score: "",
        },
      ],
    });
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.technicalSkills.filter(
      (_, i) => i !== index,
    );

    setFormData({
      ...formData,
      technicalSkills: updatedSkills,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInterview) {
      return toast.error("Select an interview");
    }

    try {
      const payload = {
        interview: selectedInterview._id,
        candidate: selectedInterview.candidate._id,
        interviewer: selectedInterview.interviewer._id,
        title: selectedInterview.title,
        interviewDate: selectedInterview.date,

        overallScore: Number(formData.overallScore),
        communication: Number(formData.communication),
        problemSolving: Number(formData.problemSolving),

        technicalSkills: formData.technicalSkills.map((skill) => ({
          name: skill.name,
          score: Number(skill.score),
        })),

        strengths: formData.strengths
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        areasForImprovement: formData.areasForImprovement
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        aiFeedback: formData.aiFeedback,

        status: "completed",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/add`,
        payload,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        toast.success("Report Added Successfully");

        navigate("/dashboard/reports");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Add Report</h1>

        <p className="text-gray-400 mb-8">
          Create a report for a completed interview.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Select Interview
            </h2>

            <select
              className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              onChange={(e) => {
                const interview = interviews.find(
                  (item) => item._id === e.target.value,
                );

                setSelectedInterview(interview);
              }}
              defaultValue=""
            >
              <option value="">Select Completed Interview</option>

              {interviews.map((interview) => (
                <option key={interview._id} value={interview._id}>
                  {interview.title} - {interview.candidate?.name}
                </option>
              ))}
            </select>
          </div>

          {selectedInterview && (
            <>
              <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">
                  Interview Details
                </h2>

                <div className="grid md:grid-cols-2 gap-4 text-white">
                  <div>Candidate: {selectedInterview.candidate?.name}</div>

                  <div>Interviewer: {selectedInterview.interviewer?.name}</div>

                  <div>Title: {selectedInterview.title}</div>

                  <div>Language: {selectedInterview.language}</div>
                </div>
              </div>

              <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">
                  Scores
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Overall Score"
                    value={formData.overallScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overallScore: e.target.value,
                      })
                    }
                    className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  />

                  <input
                    type="number"
                    placeholder="Communication"
                    value={formData.communication}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        communication: e.target.value,
                      })
                    }
                    className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  />

                  <input
                    type="number"
                    placeholder="Problem Solving"
                    value={formData.problemSolving}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemSolving: e.target.value,
                      })
                    }
                    className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white text-lg font-semibold">
                    Technical Skills
                  </h2>

                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg"
                  >
                    Add Skill
                  </button>
                </div>

                {formData.technicalSkills.map((skill, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Skill Name"
                      value={skill.name}
                      onChange={(e) =>
                        handleSkillChange(index, "name", e.target.value)
                      }
                      className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                    />

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Score"
                        value={skill.score}
                        onChange={(e) =>
                          handleSkillChange(index, "score", e.target.value)
                        }
                        className="flex-1 bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                      />

                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="px-4 bg-red-500 rounded-xl text-white"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6 space-y-4">
                <textarea
                  placeholder="Strengths (comma separated)"
                  value={formData.strengths}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      strengths: e.target.value,
                    })
                  }
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  rows={4}
                />

                <textarea
                  placeholder="Areas For Improvement (comma separated)"
                  value={formData.areasForImprovement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      areasForImprovement: e.target.value,
                    })
                  }
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  rows={4}
                />

                <textarea
                  placeholder="AI Feedback"
                  value={formData.aiFeedback}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiFeedback: e.target.value,
                    })
                  }
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
                  rows={6}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium"
                >
                  Create Report
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddReport;
