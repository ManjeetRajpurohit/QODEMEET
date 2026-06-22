import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { User, Briefcase } from "lucide-react";
import logo from "../assets/LOGO.png";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Signup = () => {
  const [role, setRole] = useState("candidate");
  const [email,setemail]=useState('');
  const [password,setpassword]=useState('');
  const [phoneNumber,setphoneNumber]=useState('');
  const [name,setname]=useState('');
  const {backendUrl,navigate,token}=useContext(AppContext);
  const handleonSubmit=async(e)=>{
    e.preventDefault();
    if(!name || ! email || !password || ! phoneNumber){
      toast.error("incomplete details");
      return;
    }
    try{
       const response=await axios.post(backendUrl+'/api/user/register',{name,email,password,role,phoneNumber});
       if(response.data.success){
        localStorage.setItem("token",response.data.token);
        toast.success("Account Created");
        navigate('/dashboard');
        setname('')
        setemail('')
        setRole("candidate");
        setpassword('')
        setphoneNumber('');
       }
       else{
        toast.error(response.data.message);
       }
    }
    catch(error){
      toast.error(error.message);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#050816] to-[#120A2A] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12"
          />

          <h1 className="text-3xl font-bold text-white">
            Interview
            <span className="text-purple-400">
              Pro
            </span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              Create your account
            </h2>

            <p className="text-gray-400">
              Create your InterviewPro account and get started.
            </p>
          </div>

          <form onSubmit={handleonSubmit} className="space-y-5">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                onChange={(e)=>setname(e.target.value)}
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
              />

              <input
              onChange={(e)=>setphoneNumber(e.target.value)}
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Email */}
            <input
            onChange={(e)=>setemail(e.target.value)}
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
            />

            {/* Password */}
            <input
            onChange={(e)=>setpassword(e.target.value)}
              type="password"
              placeholder="Create Password"
              className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
            />

            {/* Role Selection */}
            <div>
              <p className="text-gray-300 mb-3">
                I am a...
              </p>

              <div className="space-y-3">

                {/* Candidate */}

                <button
                  type="button"
                  onClick={() =>
                    setRole("candidate")
                  }
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition ${
                    role === "candidate"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-700 hover:border-purple-500"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User size={22} className="text-white" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-white font-semibold">
                      Candidate
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Take coding interviews and track progress.
                    </p>
                  </div>
                </button>

                {/* Interviewer */}

                <button
                  type="button"
                  onClick={() =>
                    setRole("interviewer")
                  }
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition ${
                    role === "interviewer"
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-700 hover:border-purple-500"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Briefcase size={22} className="text-white" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-white font-semibold">
                      Interviewer
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Schedule interviews and evaluate candidates.
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* Google Signup */}

            <button
             onClick={()=>window.open(import.meta.env.VITE_BACKEND_URL+'/api/auth/google',"_self")}
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

            {/* Divider */}

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-700"></div>

              <span className="text-gray-500 text-sm">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-700"></div>
            </div>

            {/* Create Account */}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:opacity-90 transition"
            >
              Create Account 
            </button>

            {/* Login Link */}

            <p className="text-center text-gray-400">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="text-white font-semibold hover:text-purple-400"
              >
                Log in
              </NavLink>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;