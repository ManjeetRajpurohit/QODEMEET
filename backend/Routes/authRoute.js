
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import sendWelcomeMail from "../utils/sendWelcomeMail.js";
import cookieOptions from "../config/cookieOptions.js";

import { googleOAuthLimiter } from "../middleware/authRateLimit.js";

const googleRouter = express.Router();

// ==========================================
// GOOGLE OAUTH INITIATION
// ==========================================

googleRouter.get(
  "/google",
  googleOAuthLimiter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// ==========================================
// GOOGLE OAUTH CALLBACK
// ==========================================

// Intentionally not rate-limited here.
// Google redirects legitimate users to this endpoint after consent.

googleRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          tokenVersion: req.user.tokenVersion ?? 0,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
          algorithm: "HS256",
        }
      );

      // Account creation must not depend on welcome email delivery.
      if (req.user.isNewUser) {
        sendWelcomeMail({
          name: req.user.name,
          email: req.user.email,
        }).catch((mailError) => {
          console.error(
            "Welcome mail failed:",
            mailError.message
          );
        });
      }

      res.cookie("qodemeet_token", token, cookieOptions);

      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-success`
      );
    } catch (error) {
      console.error("Google Login Error:", error);

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }
  }
);

export default googleRouter;
