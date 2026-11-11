
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import imagekit from "../config/imagekit.js";
import sendOtpMail from "../utils/sendOtpMail.js";
import sendWelcomeMail from "../utils/sendWelcomeMail.js";
import transporter from "../config/mail.js";
import cookieOptions from "../config/cookieOptions.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const ALLOWED_ROLES = ["candidate", "interviewer"];

// Remove private fields before returning user data.

const sanitizeUser = (user) => {
  if (!user) return null;

  const safeUser = user.toObject
    ? user.toObject()
    : { ...user };

  const sensitiveFields = [
    "password",
    "googleId",
    "otp",
    "otpExpiry",
    "otpAttempts",
    "tokenVersion",
    "passwordResetOtp",
    "passwordResetOtpExpiry",
    "passwordResetAttempts",
    "passwordResetTokenHash",
    "passwordResetTokenExpiry",
    "__v",
  ];

  for (const field of sensitiveFields) {
    delete safeUser[field];
  }

  return safeUser;
};

// Safely parse JSON fields from multipart/form-data.
const parseField = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  return JSON.parse(value);
};

const parseProfileObject = (value, allowedFields, maxLength = 200) => {
  const parsed = parseField(value, {});

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error("Invalid profile data");
  }

  const result = {};

  for (const [key, fieldValue] of Object.entries(parsed)) {
    if (!allowedFields.includes(key)) {
      throw new Error(`Invalid profile field: ${key}`);
    }

    if (
      typeof fieldValue !== "string" ||
      fieldValue.length > maxLength
    ) {
      throw new Error(`Invalid value for ${key}`);
    }

    result[key] = fieldValue.trim();
  }

  return result;
};

const isValidImageBuffer = (buffer) => {
  if (!Buffer.isBuffer(buffer)) return false;

  // JPEG
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) return true;

  // PNG
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) return true;

  // GIF
  if (
    buffer.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6))
  ) return true;

  // WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) return true;

  return false;
};

const isValidPdfBuffer = (buffer) => {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length >= 5 &&
    buffer.toString("ascii", 0, 5) === "%PDF-"
  );
};

// ==========================================
// LOGIN
// ==========================================

const handleLogin = async (req, res) => {
  try {
    const { username, password, role } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !ALLOWED_ROLES.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
      });
    }

    const user = await userModel
      .findOne({
        username: username.toLowerCase().trim(),
      })
      .select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or use Google sign-in",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch || role !== user.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion ?? 0 },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.cookie("qodemeet_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

// ==========================================
// REGISTER
// ==========================================

const handleRegister = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      role,
      phoneNumber,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete details",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    if (!USERNAME_REGEX.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-20 characters: lowercase letters, numbers and underscores only",
      });
    }

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name is too long",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.username === cleanUsername
            ? "Username already taken"
            : "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role,
      phoneNumber,
      authProvider: "local",
      isVerified: false,
    });

    sendWelcomeMail({
      name: user.name,
      email: user.email,
    }).catch((error) => {
      console.error("Welcome email failed:", error.message);
    });

    const token = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion ?? 0 },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.cookie("qodemeet_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to register",
    });
  }
};

// ==========================================
// SELECT ROLE (GOOGLE OAUTH)
// ==========================================

const selectRole = async (req, res) => {
  try {
    const { role } = req.body || {};

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userModel.findOneAndUpdate(
      {
        _id: req.user._id,
        role: { $in: [null, ""] },
      },
      {
        $set: { role },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "Role already set or user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Select role error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to select role",
    });
  }
};

// ==========================================
// SEND VERIFICATION OTP
// ==========================================

const sendVerificationOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const now = new Date();

    // Atomically claim the right to issue a new OTP.
    const user = await userModel.findOneAndUpdate(
      {
        _id: userId,
        isVerified: false,
        $or: [
          { otpExpiry: null },
          { otpExpiry: { $exists: false } },
          { otpExpiry: { $lte: now } },
        ],
      },
      {
        $set: {
          otp: otpHash,
          otpExpiry: new Date(now.getTime() + OTP_EXPIRY_MS),
          otpAttempts: 0,
        },
      },
      { new: true }
    );

    if (!user) {
      const existingUser = await userModel
        .findById(userId)
        .select("+otpExpiry");

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Account already verified",
        });
      }

      return res.status(429).json({
        success: false,
        message: "A verification code is already active. Please use it or wait until it expires.",
      });
    }

    try {
      await sendOtpMail({
        name: user.name,
        email: user.email,
        otp,
      });
    } catch (mailError) {
      // Only clear the OTP created by this request.
      await userModel.updateOne(
        { _id: user._id, otp: otpHash },
        {
          $set: {
            otp: null,
            otpExpiry: null,
            otpAttempts: 0,
          },
        }
      );

      console.error("OTP email failed:", mailError);

      return res.status(503).json({
        success: false,
        message: "Unable to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send verification code",
    });
  }
};

// ==========================================
// VERIFY ACCOUNT
// ==========================================

const verifyAccount = async (req, res) => {
  try {
    const { otp } = req.body || {};

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid six-digit verification code",
      });
    }

    const user = await userModel
      .findById(req.user._id)
      .select("+otp +otpExpiry +otpAttempts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    const now = new Date();
    const otpHash = user.otp;

    if (
      !otpHash ||
      !user.otpExpiry ||
      user.otpExpiry <= now ||
      user.otpAttempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Code expired or invalid. Please request a new one.",
      });
    }

    const isValidOtp = await bcrypt.compare(otp, otpHash);

    // Match the exact OTP hash so an old request cannot modify a newer OTP.
    const activeOtpFilter = {
      _id: user._id,
      isVerified: false,
      otp: otpHash,
      otpExpiry: { $gt: now },
      $or: [
        { otpAttempts: { $lt: 5 } },
        { otpAttempts: { $exists: false } },
      ],
    };

    if (!isValidOtp) {
      const attemptResult = await userModel.updateOne(
        activeOtpFilter,
        { $inc: { otpAttempts: 1 } }
      );

      if (attemptResult.modifiedCount === 1) {
        await userModel.updateOne(
          {
            _id: user._id,
            otp: otpHash,
            otpAttempts: { $gte: 5 },
          },
          {
            $set: {
              otp: null,
              otpExpiry: null,
            },
          }
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Consume the OTP and verify the account in one atomic operation.
    const verifiedUser = await userModel.findOneAndUpdate(
      activeOtpFilter,
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpAttempts: 0,
        },
      },
      { new: true }
    );

    if (!verifiedUser) {
      return res.status(400).json({
        success: false,
        message: "Code expired or already used. Please request a new one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error("Verify account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify account",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

const logout = async (req, res) => {
  try {
    const result = await userModel.updateOne(
      { _id: req.user._id },
      { $inc: { tokenVersion: 1 } }
    );

    if (result.matchedCount !== 1) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid",
      });
    }

    const io = req.app.get("io");
    io?.in(`user:${req.user._id.toString()}`).disconnectSockets(true);

    const { maxAge, ...clearOptions } = cookieOptions;
    res.clearCookie("qodemeet_token", clearOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};

// ==========================================
// PASSWORD RESET
// ==========================================

const requestPasswordResetOtp = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const genericResponse = {
      success: true,
      message: "If the account exists, a password reset code has been sent.",
    };

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const now = new Date();

    // A second concurrent request cannot overwrite an active reset OTP.
    const user = await userModel.findOneAndUpdate(
      {
        email,
        password: { $exists: true, $ne: null },
        $or: [
          { passwordResetOtpExpiry: null },
          { passwordResetOtpExpiry: { $exists: false } },
          { passwordResetOtpExpiry: { $lte: now } },
        ],
      },
      {
        $set: {
          passwordResetOtp: otpHash,
          passwordResetOtpExpiry: new Date(now.getTime() + OTP_EXPIRY_MS),
          passwordResetAttempts: 0,
          passwordResetTokenHash: null,
          passwordResetTokenExpiry: null,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Your QodeMeet password reset code",
        html: `<div style="font-family:Arial,sans-serif"><h2>Password reset</h2><p>Your QodeMeet reset code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">${otp}</p><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`,
      });
    } catch (mailError) {
      // Only clear the OTP created by this request.
      await userModel.updateOne(
        { _id: user._id, passwordResetOtp: otpHash },
        {
          $set: {
            passwordResetOtp: null,
            passwordResetOtpExpiry: null,
            passwordResetAttempts: 0,
          },
        }
      );

      console.error("Password reset email failed:", mailError.message);

      return res.status(503).json({
        success: false,
        message: "Unable to send reset code. Please try again.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Request password reset error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset",
    });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    const otp = req.body?.otp;

    if (
      !validator.isEmail(email) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and six-digit code",
      });
    }

    const user = await userModel.findOne({ email }).select(
      "+passwordResetOtp +passwordResetOtpExpiry +passwordResetAttempts"
    );

    const now = new Date();

    if (
      !user ||
      !user.passwordResetOtp ||
      !user.passwordResetOtpExpiry ||
      user.passwordResetOtpExpiry <= now ||
      user.passwordResetAttempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    const otpHash = user.passwordResetOtp;
    const validOtp = await bcrypt.compare(otp, otpHash);

    const activeOtpFilter = {
      _id: user._id,
      passwordResetOtp: otpHash,
      passwordResetOtpExpiry: { $gt: now },
      $or: [
        { passwordResetAttempts: { $lt: 5 } },
        { passwordResetAttempts: { $exists: false } },
      ],
    };

    if (!validOtp) {
      const attemptResult = await userModel.updateOne(
        activeOtpFilter,
        { $inc: { passwordResetAttempts: 1 } }
      );

      if (attemptResult.modifiedCount === 1) {
        await userModel.updateOne(
          {
            _id: user._id,
            passwordResetOtp: otpHash,
            passwordResetAttempts: { $gte: 5 },
          },
          {
            $set: {
              passwordResetOtp: null,
              passwordResetOtpExpiry: null,
            },
          }
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Consume the OTP and create the reset token atomically.
    const updatedUser = await userModel.findOneAndUpdate(
      activeOtpFilter,
      {
        $set: {
          passwordResetOtp: null,
          passwordResetOtpExpiry: null,
          passwordResetAttempts: 0,
          passwordResetTokenHash: resetTokenHash,
          passwordResetTokenExpiry: new Date(now.getTime() + 10 * 60 * 1000),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    return res.status(200).json({
      success: true,
      resetToken,
      message: "Code verified. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify reset code",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body || {};

    if (
      typeof email !== "string" ||
      !validator.isEmail(email.trim()) ||
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/i.test(resetToken) ||
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      Buffer.byteLength(newPassword, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset details or password (minimum 8 characters)",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // The reset token is consumed atomically. Concurrent reuse cannot
    // successfully update the same account twice.
    const user = await userModel.findOneAndUpdate(
      {
        email: email.trim().toLowerCase(),
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiry: { $gt: new Date() },
      },
      {
        $set: {
          password: passwordHash,
          passwordResetTokenHash: null,
          passwordResetTokenExpiry: null,
          passwordResetOtp: null,
          passwordResetOtpExpiry: null,
          passwordResetAttempts: 0,
          otpAttempts: 0,
        },
        $inc: { tokenVersion: 1 },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset session is invalid or expired. Request a new code.",
      });
    }

    const io = req.app.get("io");
    io?.in(`user:${user._id.toString()}`).disconnectSockets(true);

    const { maxAge, ...clearOptions } = cookieOptions;
    res.clearCookie("qodemeet_token", clearOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateuser = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      username,
      phoneNumber,
      location,
      skills,
      socialLinks,
      education,
      experience,
    } = req.body || {};

    const updateData = {};

    // Role, email, password, verification and subscription
    // fields are deliberately not editable through this endpoint.

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid name",
        });
      }

      updateData.name = name.trim();
    }

    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid username",
        });
      }

      const cleanUsername = username.toLowerCase().trim();

      if (!USERNAME_REGEX.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          message: "Username must be 3-20 characters: lowercase letters, numbers and underscores only",
        });
      }

      const taken = await userModel.findOne({
        username: cleanUsername,
        _id: { $ne: userId },
      });

      if (taken) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
        });
      }

      updateData.username = cleanUsername;
    }

    if (phoneNumber !== undefined) {
      if (
        typeof phoneNumber !== "string" ||
        phoneNumber.length > 30
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number",
        });
      }

      updateData.phoneNumber = phoneNumber;
    }

    if (location !== undefined) {
      if (
        typeof location !== "string" ||
        location.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid location",
        });
      }

      updateData.location = location;
    }

    try {
      if (skills !== undefined) {
        const parsed = parseField(skills, []);

        if (
          !Array.isArray(parsed) ||
          parsed.length > 50 ||
          parsed.some(
            (skill) =>
              typeof skill !== "string" ||
              !skill.trim() ||
              skill.trim().length > 50
          )
        ) {
          throw new Error("Invalid skills");
        }

        updateData.skills = [
          ...new Set(parsed.map((skill) => skill.trim())),
        ];
      }

      if (socialLinks !== undefined) {
        updateData.socialLinks = parseProfileObject(
          socialLinks,
          ["linkedin", "github", "portfolio"]
        );
      }

      if (education !== undefined) {
        updateData.education = parseProfileObject(
          education,
          ["college", "degree", "graduationYear"]
        );
      }

      if (experience !== undefined) {
        updateData.experience = parseProfileObject(
          experience,
          ["company", "designation", "duration"]
        );
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: parseError.message,
      });
    }

    // Avatar upload: validate MIME type and file signature.
    if (req.files?.avatar?.[0]) {
      const file = req.files.avatar[0];
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (
        !allowedImageTypes.includes(file.mimetype) ||
        file.size > 5 * 1024 * 1024 ||
        !isValidImageBuffer(file.buffer)
      ) {
        return res.status(400).json({
          success: false,
          message: "Avatar must be a valid JPEG, PNG, WEBP or GIF image under 5MB",
        });
      }

      const avatarUpload = await imagekit.upload({
        file: file.buffer,
        fileName: `avatar-${userId}-${Date.now()}`,
        folder: "/InterviewPro/avatars",
      });

      updateData.avatar = avatarUpload.url;
    }

    // Resume upload: validate MIME type and PDF signature.
    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];

      if (
        file.mimetype !== "application/pdf" ||
        file.size > 5 * 1024 * 1024 ||
        !isValidPdfBuffer(file.buffer)
      ) {
        return res.status(400).json({
          success: false,
          message: "Resume must be a valid PDF smaller than 5MB",
        });
      }

      const resumeUpload = await imagekit.upload({
        file: file.buffer,
        fileName: `resume-${userId}-${Date.now()}.pdf`,
        folder: "/InterviewPro/resumes",
      });

      updateData.resume = resumeUpload.url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile changes provided",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

// ==========================================
// GET USER BY EMAIL
// ==========================================

const getUserbyemail = async (req, res) => {
  try {
    const { email } = req.query || {};

    if (
      typeof email !== "string" ||
      !validator.isEmail(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const user = await userModel
      .findOne({
        email: email.toLowerCase().trim(),
        role: "candidate",
      })
      .select("_id email isVerified");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No candidate exists with this email",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by email error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve candidate",
    });
  }
};

// ==========================================
// GET SUBSCRIPTION
// ==========================================

const getSubscription = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let remainingInterviews = "Unlimited";

    if (user.subscriptionPlan === "Free") {
      remainingInterviews = Math.max(
        0,
        1 - (user.interviewsUsed || 0)
      );
    }

    if (user.subscriptionPlan === "Pro") {
      remainingInterviews = Math.max(
        0,
        15 - (user.interviewsUsed || 0)
      );
    }

    return res.status(200).json({
      success: true,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiry: user.subscriptionExpiry,
      interviewsUsed: user.interviewsUsed,
      remainingInterviews,
      upcomingPlan: user.upcomingPlan,
      upcomingPlanExpiry: user.upcomingPlanExpiry,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve subscription",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  handleLogin,
  handleRegister,
  selectRole,
  sendVerificationOtp,
  verifyAccount,
  getCurrentUser,
  logout,
  updateuser,
  getUserbyemail,
  getSubscription,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
};
