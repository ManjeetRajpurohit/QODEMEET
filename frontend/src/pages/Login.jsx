import React from "react";
import logo from "../assets/LOGO.png";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/Appcontext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [role, setRole] = React.useState("candidate");

  const { backendUrl, navigate, setToken } = useContext(AppContext);

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please fill all fields");
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/user/login",
        {
          email,
          password,
          role,
        }
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);

        setToken(response.data.token);

        toast.success("Login Successful");

        setRole("candidate");
        setemail("");
        setpassword("");

        navigate("/dashboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#050816] to-[#120A2A] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12"
          />

          <p className="text-3xl font-bold text-white">
            Interview
            <span className="text-purple-400">
              Pro
            </span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back
            </h1>

            <p className="text-gray-400">
              Sign in to continue to your dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 mb-2"
              >
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setemail(e.target.value)}
                type="email"
                id="email"
                placeholder="sarah@interviewpro.com"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-300 mb-2"
              >
                Password
              </label>

              <input
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Role Selection */}
            <div>
              <p className="text-gray-300 mb-3">
                Sign in as
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`py-3 rounded-xl transition ${
                    role === "candidate"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "border border-gray-700 text-gray-300 hover:border-purple-500"
                  }`}
                >
                  Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setRole("interviewer")}
                  className={`py-3 rounded-xl transition ${
                    role === "interviewer"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "border border-gray-700 text-gray-300 hover:border-purple-500"
                  }`}
                >
                  Interviewer
                </button>
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:opacity-90 transition"
            >
              Continue
            </button>

            {/* Google Login */}
            <button
              onClick={() =>
                window.open(
                  import.meta.env.VITE_BACKEND_URL +
                    "/api/auth/google",
                  "_self"
                )
              }
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-700 text-white hover:border-purple-500 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />

              Continue with Google
            </button>

            {/* Links */}
            <div className="flex justify-between text-sm">
              <NavLink
                to="/signup"
                className="text-gray-400 hover:text-purple-400"
              >
                Create Account
              </NavLink>

              <NavLink
                to="/forgot-password"
                className="text-gray-400 hover:text-purple-400"
              >
                Forgot Password?
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;