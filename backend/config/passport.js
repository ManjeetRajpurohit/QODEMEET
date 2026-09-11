import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";
import sendWelcomeMail from "../utils/sendWelcomeMail.js";

// Turns a Google display name into a valid, unique username (matches
// userModel's ^[a-z0-9_]{3,20}$). Falls back to "user" if the name has
// no usable characters, and appends digits on collision. The user can
// rename it later from their profile page.
const generateUniqueUsername = async (displayName) => {
  const base =
    (displayName || "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 16) || "user";

  let candidate = base.length < 3 ? base.padEnd(3, "0") : base;
  let suffix = 0;

  while (await userModel.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`.slice(0, 20);
  }

  return candidate;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await userModel.findOne({
          googleId: profile.id,
        });

        if (!user) {
          const username = await generateUniqueUsername(profile.displayName);

          user = await userModel.create({
            googleId: profile.id,
            name: profile.displayName,
            username,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
            authProvider: "google",
            // Google has already confirmed this address is real and
            // owned by this person, so there's nothing left to verify.
            isVerified: true,
          });

          sendWelcomeMail({ name: user.name, email: user.email }).catch(
            (mailError) => {
              console.log("Welcome mail failed:", mailError.message);
            },
          );
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);
