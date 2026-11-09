import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

// Google gives us an email, not a username, but our schema requires a
// unique one matching /^[a-z0-9_]{3,20}$/. Derive one from the email's
// local part, sanitize it into that shape, and append a short random
// suffix if it's taken - retrying a few times rather than failing the
// whole signup over a naming collision.
const generateUsernameFromEmail = async (email) => {
  const base = (email?.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15) || "user";

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate =
      attempt === 0
        ? base.padEnd(3, "0").slice(0, 20)
        : `${base.slice(0, 15)}${Math.floor(1000 + Math.random() * 9000)}`;

    const taken = await userModel.findOne({ username: candidate });

    if (!taken) {
      return candidate;
    }
  }

  // Extremely unlikely fallback if 5 random attempts all collided.
  return `user${Date.now().toString().slice(-10)}`;
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

        let isNewUser = false;

        if (!user) {
          const email = profile.emails?.[0]?.value;
          const username = await generateUsernameFromEmail(email);

          user = await userModel.create({
            googleId: profile.id,
            name: profile.displayName,
            username,
            email,
            avatar: profile.photos?.[0]?.value,
            authProvider: "google",
            isVerified: true,
            role: null,
          });

          isNewUser = true;
        }

        // Not a schema field - just riding along on the user object so
        // the /google/callback route can tell new signups from repeat
        // logins without a second DB query.
        user = user.toObject ? user.toObject() : user;
        user.isNewUser = isNewUser;

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);
