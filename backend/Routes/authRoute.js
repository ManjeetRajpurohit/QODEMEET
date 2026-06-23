import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import userAuth from "../middleware/userAuth.js";

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

      res.redirect(
  `${process.env.FRONTEND_URL}/?token=${token}`
);
    } catch (error) {
      console.error("Google Login Error:", error);

      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }
  }
);

googleRouter.get("/me", userAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default googleRouter;
