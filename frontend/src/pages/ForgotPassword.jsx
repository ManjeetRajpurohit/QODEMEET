import React, { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleSendOtp = () => {
    setError("");

    // Backend call later
    // Check if email exists

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setStep(2);
  };

  const handleVerifyOtp = () => {
    setError("");

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    // Backend OTP verification later

    setStep(3);
  };

  const handleResetPassword = () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Backend password reset later

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Recover access to your account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="relative mb-6">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-lg py-3 text-white font-medium"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative mb-6">
              <ShieldCheck
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-lg py-3 text-white font-medium"
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative mb-4">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="relative mb-6">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleResetPassword}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-lg py-3 text-white font-medium"
            >
              Reset Password
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;