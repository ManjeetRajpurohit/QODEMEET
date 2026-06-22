import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import imagekit from "../config/imagekit.js";

const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.json({
        success: false,
        message: "Incomplete details",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (role !== user.role) {
      return res.json({
        success: false,
        message: "Unauthorized role",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const handleRegister = async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.json({
        success: false,
        message: "Incomplete details",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const updateuser = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      role,
      phoneNumber,
      location,
      skills,
      socialLinks,
      education,
      experience,
    } = req.body;

    if (role && role !== "candidate" && role !== "interviewer") {
      return res.json({
        success: false,
        message: "Invalid role",
      });
    }

    let updateData = {
      name,
      role,
      phoneNumber,
      location,
      skills: skills ? JSON.parse(skills) : [],
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      education: education ? JSON.parse(education) : {},
      experience: experience ? JSON.parse(experience) : {},
    };

    if (req.files?.avatar?.[0]) {
      const avatarUpload = await imagekit.upload({
        file: req.files.avatar[0].buffer,
        fileName: `avatar-${Date.now()}`,
        folder: "/InterviewPro/avatars",
      });

      updateData.avatar = avatarUpload.url;
    }

    if (req.files?.resume?.[0]) {
      const resumeUpload = await imagekit.upload({
        file: req.files.resume[0].buffer,
        fileName: `resume-${Date.now()}.pdf`,
        folder: "/InterviewPro/resumes",
      });

      updateData.resume = resumeUpload.url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getUserbyemail = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "No user exists",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const getSubscription = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    let remainingInterviews = "Unlimited";

    if (user.subscriptionPlan === "Free") {
      remainingInterviews = Math.max(0, 1 - user.interviewsUsed);
    }

    if (user.subscriptionPlan === "Pro") {
      remainingInterviews = Math.max(0, 15 - user.interviewsUsed);
    }

    return res.json({
      success: true,

      subscriptionPlan: user.subscriptionPlan,

      subscriptionExpiry: user.subscriptionExpiry,

      interviewsUsed: user.interviewsUsed,

      remainingInterviews,

      upcomingPlan: user.upcomingPlan,

      upcomingPlanExpiry: user.upcomingPlanExpiry,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};
export {
  handleLogin,
  handleRegister,
  getCurrentUser,
  updateuser,
  getUserbyemail,
  getSubscription,
};
