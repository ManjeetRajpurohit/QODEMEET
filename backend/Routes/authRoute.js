import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import sendWelcomeMail from "../utils/sendWelcomeMail.js";
import cookieOptions from "../config/cookieOptions.js";

const googleRouter = express.Router();

googleRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

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
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // Account is already created at this point, so a slow or failed
      // welcome mail must never block the redirect - same pattern as
      // the local signup flow.
      if (req.user.isNewUser) {
        sendWelcomeMail({ name: req.user.name, email: req.user.email }).catch(
          (mailError) => {
            console.log("Welcome mail failed:", mailError.message);
          }
        );
      }

      res.cookie("qodemeet_token", token, cookieOptions);
      return res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
    } catch (error) {
      console.error("Google Login Error:", error);

      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }
  }
);


export default googleRouter;
