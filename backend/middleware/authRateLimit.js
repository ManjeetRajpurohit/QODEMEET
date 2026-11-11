
import { createHash } from "node:crypto";
import {
  rateLimit,
  ipKeyGenerator,
} from "express-rate-limit";

const hashIdentifier = (value) =>
  createHash("sha256").update(value).digest("hex");

const createLimiter = ({
  windowMs,
  limit,
  identifier,
  message,
  keyGenerator,
}) =>
  rateLimit({
    windowMs,
    limit,
    identifier,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...(keyGenerator ? { keyGenerator } : {}),
    message: {
      success: false,
      message,
    },
  });

const createIpLimiter = (options) => createLimiter(options);

// Uses email when present, otherwise username.
// This matches the actual login and registration request bodies.
const createAccountLimiter = (options) =>
  createLimiter({
    ...options,
    keyGenerator: (req) => {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";

      const username =
        typeof req.body?.username === "string"
          ? req.body.username.trim().toLowerCase()
          : "";

      if (email) {
        return `email:${hashIdentifier(email)}`;
      }

      if (username) {
        return `username:${hashIdentifier(username)}`;
      }

      return `ip:${ipKeyGenerator(req.ip)}`;
    },
  });

const createUserLimiter = (options) =>
  createLimiter({
    ...options,
    keyGenerator: (req) => {
      const userId = req.user?._id?.toString();

      if (userId) {
        return `user:${userId}`;
      }

      return `ip:${ipKeyGenerator(req.ip)}`;
    },
  });

// ==========================================
// IP-BASED LIMITERS
// ==========================================

export const loginLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  identifier: "login-ip",
  message: "Too many login attempts. Please try again after 15 minutes.",
});

export const registrationLimiter = createIpLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  identifier: "registration-ip",
  message: "Too many registration attempts. Please try again later.",
});

export const passwordResetRequestLimiter = createIpLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  identifier: "password-reset-request-ip",
  message: "Too many password reset requests. Please try again later.",
});

export const passwordResetVerifyLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "password-reset-verify-ip",
  message: "Too many OTP verification attempts. Please try again later.",
});

export const passwordResetCompleteLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "password-reset-complete-ip",
  message: "Too many password reset attempts. Please try again later.",
});

export const verificationOtpRequestLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  identifier: "verification-otp-request-ip",
  message: "Too many verification OTP requests. Please try again later.",
});

export const verificationOtpVerifyLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "verification-otp-verify-ip",
  message: "Too many verification attempts. Please try again later.",
});

export const googleOAuthLimiter = createIpLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  identifier: "google-oauth-ip",
  message: "Too many Google login attempts. Please try again later.",
});

// ==========================================
// ACCOUNT-BASED LIMITERS
// ==========================================

export const loginAccountLimiter = createAccountLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  identifier: "login-account",
  message: "Too many login attempts for this account. Please try again later.",
});

export const registrationAccountLimiter = createAccountLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  identifier: "registration-account",
  message: "Too many registration attempts for this account. Please try again later.",
});

export const passwordResetRequestAccountLimiter = createAccountLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  identifier: "password-reset-request-account",
  message: "Too many password reset requests for this account. Please try again later.",
});

export const passwordResetVerifyAccountLimiter = createAccountLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "password-reset-verify-account",
  message: "Too many OTP verification attempts for this account. Please try again later.",
});

export const passwordResetCompleteAccountLimiter = createAccountLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "password-reset-complete-account",
  message: "Too many password reset attempts for this account. Please try again later.",
});

export const verificationOtpRequestAccountLimiter = createUserLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  identifier: "verification-otp-request-account",
  message: "Too many verification OTP requests for this account. Please try again later.",
});

export const verificationOtpVerifyAccountLimiter = createUserLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  identifier: "verification-otp-verify-account",
  message: "Too many verification attempts for this account. Please try again later.",
});
