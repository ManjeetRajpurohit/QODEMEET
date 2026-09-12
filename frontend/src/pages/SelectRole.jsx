import React, { useContext, useState } from "react";
import { User, Briefcase, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";
import logo from "../assets/LOGO.png";

const SelectRole = () => {
  const { backendUrl, token, setUser, navigate } = useContext(AppContext);

  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!role) {
      toast.error("Pick one to continue");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/select-role`,
        { role },
        { headers: { token } },
      );

      if (response.data.success) {
        setUser(response.data.user);
        toast.success("You're all set");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#050816] to-[#120A2A] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-white">
            Qode<span className="text-purple-400">Meet</span>
          </h1>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              How will you use QodeMeet?
            </h2>
            <p className="text-gray-400">
              This can't be changed later, so pick the one that fits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`text-left p-6 rounded-2xl border transition ${
                role === "candidate"
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-gray-700 hover:border-purple-500"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <User size={22} className="text-white" />
              </div>

              <h3 className="text-white font-semibold text-lg mb-1">
                Candidate
              </h3>

              <p className="text-gray-400 text-sm">
                Take coding interviews and track your progress.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("interviewer")}
              className={`text-left p-6 rounded-2xl border transition ${
                role === "interviewer"
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-gray-700 hover:border-purple-500"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Briefcase size={22} className="text-white" />
              </div>

              <h3 className="text-white font-semibold text-lg mb-1">
                Interviewer
              </h3>

              <p className="text-gray-400 text-sm">
                Schedule interviews and evaluate candidates.
              </p>
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={!role || submitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Continue"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
