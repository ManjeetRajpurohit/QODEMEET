
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]{3,20}$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    // Only two supported roles.
    // Role selection is permitted only once.
    role: {
      type: String,
      enum: ["candidate", "interviewer"],
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetAttempts: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    resume: {
      type: String,
      default: "",
    },

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
      },

      github: {
        type: String,
        default: "",
      },

      portfolio: {
        type: String,
        default: "",
      },
    },

    education: {
      college: String,
      degree: String,
      graduationYear: String,
    },

    experience: {
      company: String,
      designation: String,
      duration: String,
    },

    subscriptionPlan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise", "Annual"],
      default: "Free",
    },

    subscriptionExpiry: {
      type: Date,
      default: null,
    },

    interviewsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    billingCycleStart: {
      type: Date,
      default: Date.now,
    },

    upcomingPlan: {
      type: String,
      enum: ["Pro", "Enterprise", "Annual"],
      default: null,
    },

    upcomingPlanExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
