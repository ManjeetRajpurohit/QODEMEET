import React, { useContext, useState, useEffect } from "react";
import { Upload, Plus, X, Save } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/Appcontext.jsx";

const Profile = () => {
  const { token } = useContext(AppContext);

  const [skillInput, setSkillInput] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    role: "",
    email: "",
    phoneNumber: "",
    location: "",

    avatar: "",
    resume: "",

    skills: [],

    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
    },

    education: {
      college: "",
      degree: "",
      graduationYear: "",
    },

    experience: {
      company: "",
      designation: "",
      duration: "",
    },
  });

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSocialChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleEducationChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleExperienceChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));

    setSkillInput("");
  };

  const removeSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAvatarFile(file);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setResumeFile(file);
  };
  const handleSave = async () => {
    try {
      const formData = new FormData();

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      formData.append("name", profile.name);
      formData.append("role", profile.role);
      formData.append("phoneNumber", profile.phoneNumber);
      formData.append("location", profile.location);

      formData.append("socialLinks", JSON.stringify(profile.socialLinks));

      formData.append("education", JSON.stringify(profile.education));

      formData.append("experience", JSON.stringify(profile.experience));

      formData.append("skills", JSON.stringify(profile.skills));

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/user/update",
        formData,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        toast.success("Profile Updated");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const FetchDetail = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/api/user/me",
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        const user = response.data.user;

        setProfile({
          name: user.name || "",
          role: user.role || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          location: user.location || "",

          avatar: user.avatar || "",
          resume: user.resume || "",

          skills: user.skills || [],

          socialLinks: user.socialLinks || {
            github: "",
            linkedin: "",
            portfolio: "",
          },

          education: user.education || {
            college: "",
            degree: "",
            graduationYear: "",
          },

          experience: user.experience || {
            company: "",
            designation: "",
            duration: "",
          },
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      FetchDetail();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Profile</h1>

        <p className="text-gray-400 mt-2">Complete your profile information.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col items-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name?.charAt(0) || "U"}
                </div>
              )}

              <h2 className="text-white text-xl font-semibold mt-4 text-center">
                {profile.name}
              </h2>

              <p className="text-gray-400">{profile.role}</p>

              <label className="mt-5 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition">
                <Upload size={16} />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              {avatarFile && (
                <p className="text-green-400 text-sm mt-3">{avatarFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Name"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                placeholder="Email"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white opacity-70 cursor-not-allowed"
              />

              <select
                name="role"
                value={profile.role}
                onChange={handleChange}
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              >
                <option value="candidate">Candidate</option>
                <option value="interviewer">Interviewer</option>
              </select>

              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Location"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>
          {/* Skills */}

          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Skills</h2>

            <div className="flex gap-3 mb-5">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add Skill"
                className="flex-1 bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <button
                onClick={addSkill}
                className="px-4 bg-violet-600 rounded-xl text-white"
              >
                <Plus size={18} />
              </button>
            </div>

            {profile.skills?.length === 0 ? (
              <p className="text-gray-400">No skills added yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/20 flex items-center gap-2"
                  >
                    {skill}

                    <button onClick={() => removeSkill(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resume */}

          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Resume</h2>

            <div className="border border-dashed border-white/10 rounded-xl p-6">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="text-white"
              />

              {resumeFile ? (
                <p className="text-green-400 mt-3">{resumeFile.name}</p>
              ) : (
                profile.resume && (
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-400 mt-3 block"
                  >
                    Current Resume
                  </a>
                )
              )}
            </div>
          </div>

          {/* Social Links */}

          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Social Links</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="github"
                value={profile.socialLinks?.github || ""}
                onChange={handleSocialChange}
                placeholder="Github URL"
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="linkedin"
                value={profile.socialLinks?.linkedin || ""}
                onChange={handleSocialChange}
                placeholder="LinkedIn URL"
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="portfolio"
                value={profile.socialLinks?.portfolio || ""}
                onChange={handleSocialChange}
                placeholder="Portfolio URL"
                className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          {/* Education */}

          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Education</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                name="college"
                value={profile.education?.college || ""}
                onChange={handleEducationChange}
                placeholder="College"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="degree"
                value={profile.education?.degree || ""}
                onChange={handleEducationChange}
                placeholder="Degree"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="graduationYear"
                value={profile.education?.graduationYear || ""}
                onChange={handleEducationChange}
                placeholder="Graduation Year"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          {/* Experience */}

          <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Experience</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                name="company"
                value={profile.experience?.company || ""}
                onChange={handleExperienceChange}
                placeholder="Company"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="designation"
                value={profile.experience?.designation || ""}
                onChange={handleExperienceChange}
                placeholder="Designation"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="text"
                name="duration"
                value={profile.experience?.duration || ""}
                onChange={handleExperienceChange}
                placeholder="Duration"
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          {/* Save Button */}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
