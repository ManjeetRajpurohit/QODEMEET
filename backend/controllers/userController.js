import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import imagekit from "../config/imagekit.js";
import sendOtpMail from "../utils/sendOtpMail.js";
import sendWelcomeMail from "../utils/sendWelcomeMail.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const handleLogin = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    if (!username || !password || !role) {
      return res.json({
        success: false,
        message: "Incomplete details",
      });
    }

    const user = await userModel.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "This account uses Google sign-in. Continue with Google instead.",
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

    // Unverified users can still log in - they're just blocked from
    // interview/subscription actions (see requireVerified middleware)
    // until they verify from the profile page.
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

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const handleRegister = async (req, res) => {
  const { name, username, email, password, role, phoneNumber } = req.body;

  try {
    if (!name || !username || !email || !password || !role) {
      return res.json({
        success: false,
        message: "Incomplete details",
      });
    }

    if (role !== "candidate" && role !== "interviewer") {
      return res.json({
        success: false,
        message: "Invalid role",
      });
    }

    const cleanUsername = username.toLowerCase().trim();

    if (!USERNAME_REGEX.test(cleanUsername)) {
      return res.json({
        success: false,
        message:
          "Username must be 3-20 characters: lowercase letters, numbers, underscores only",
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

    const usernameTaken = await userModel.findOne({
      username: cleanUsername,
    });

    if (usernameTaken) {
      return res.json({
        success: false,
        message: "Username already taken",
      });
    }

    const existingEmail = await userModel.findOne({ email });

    if (existingEmail) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Role is set here, once, and is never editable again after this -
    // see selectRole/updateuser below, neither of which will touch an
    // account that already has a role.
    const user = new userModel({
      name,
      username: cleanUsername,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      authProvider: "local",
      isVerified: false,
    });

    await user.save();

    // Same pattern as the interview/billing mails below: the account
    // is already created at this point, so a slow or failed welcome
    // mail must never turn a successful signup into an error response.
    sendWelcomeMail({ name: user.name, email: user.email }).catch(
      (mailError) => {
        console.log("Welcome mail failed:", mailError.message);
      },
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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

// One-time-only: the only place a user's role can ever be set after
// account creation (used by the post-Google-OAuth "select your role"
// screen). Hard-rejects if the account already has a role - there is
// no edit path once this succeeds once.
const selectRole = async (req, res) => {
  const { role } = req.body;

  try {
    if (role !== "candidate" && role !== "interviewer") {
      return res.json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role) {
      return res.json({
        success: false,
        message: "Role already set and cannot be changed",
      });
    }

    user.role = role;

    await user.save();

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Select Role Error:", error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Both of these run behind userAuth, so they act on req.user (the
// logged-in account) rather than trusting an email/otp pair in the
// body - that's what the profile-page verification flow needs.
const sendVerificationOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    await user.save();

    try {
      await sendOtpMail({ name: user.name, email: user.email, otp });
    } catch (mailError) {
      console.log("OTP mail failed:", mailError.message);

      return res.json({
        success: false,
        message: "Couldn't send verification email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send Verification OTP Error:", error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const verifyAccount = async (req, res) => {
  const { otp } = req.body;

  try {
    if (!otp) {
      return res.json({
        success: false,
        message: "Enter the code sent to your email",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid code",
      });
    }

    if (!user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
      return res.json({
        success: false,
        message: "Code expired. Please request a new one.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({
      success: true,
      message: "Account verified",
    });
  } catch (error) {
    console.error("Verify Account Error:", error.message);

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

    // NOTE: role is intentionally not accepted here. It is set exactly
    // once - at signup for local accounts, or via selectRole for
    // Google accounts - and is never editable through this endpoint
    // or anywhere else, by design.
    const {
      name,
      username,
      phoneNumber,
      location,
      skills,
      socialLinks,
      education,
      experience,
    } = req.body;

    let updateData = {
      name,
      phoneNumber,
      location,
      skills: skills ? JSON.parse(skills) : [],
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      education: education ? JSON.parse(education) : {},
      experience: experience ? JSON.parse(experience) : {},
    };

    if (username) {
      const cleanUsername = username.toLowerCase().trim();

      if (!USERNAME_REGEX.test(cleanUsername)) {
        return res.json({
          success: false,
          message:
            "Username must be 3-20 characters: lowercase letters, numbers, underscores only",
        });
      }

      const taken = await userModel.findOne({
        username: cleanUsername,
        _id: { $ne: userId },
      });

      if (taken) {
        return res.json({
          success: false,
          message: "Username already taken",
        });
      }

      updateData.username = cleanUsername;
    }

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
  selectRole,
  sendVerificationOtp,
  verifyAccount,
  getCurrentUser,
  updateuser,
  getUserbyemail,
  getSubscription,
};
