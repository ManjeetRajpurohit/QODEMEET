import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
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
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    // Set once, either at local signup (form) or via the post-Google
    // role-select screen, and never changed again after that (see
    // selectRole in userController.js — it hard-rejects if this is
    // already non-null). null here means "hasn't picked yet."
    role: {
      type: String,
      enum: ["candidate", "interviewer", "admin"],
      default: null,
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
  },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
