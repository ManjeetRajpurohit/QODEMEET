import React, { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email");

    setLoading(true);
    try {
      await api.post("/api/user/forgot-password/send-otp", {
        email: email.trim(),
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the six-digit code");

    setLoading(true);
    try {
      const { data } = await api.post("/api/user/forgot-password/verify-otp", {
        email: email.trim(),
        otp,
      });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || !confirmPassword) return setError("Please fill all fields");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");

    setLoading(true);
    try {
      await api.post("/api/user/forgot-password/reset", {
        email: email.trim(),
        resetToken,
        newPassword,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Password reset successfully. Please login." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  const buttonClass =
    "w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition rounded-lg py-3 text-white font-medium";

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
          <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="relative mb-6">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <button disabled={loading} onClick={handleSendOtp} className={buttonClass}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative mb-6">
              <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter six-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <button disabled={loading} onClick={handleVerifyOtp} className={buttonClass}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative mb-4">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="relative mb-6">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <button disabled={loading} onClick={handleResetPassword} className={buttonClass}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
