import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

    role: {
      type: String,
      enum: ["candidate", "interviewer", "admin"],
      default: "candidate",
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
