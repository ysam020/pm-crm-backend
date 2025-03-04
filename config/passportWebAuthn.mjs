import passport from "passport";
import { Strategy as WebAuthnStrategy } from "passport-custom";
import User from "../model/userModel.mjs";

passport.use(
  "webauthn",
  new WebAuthnStrategy(async (req, done) => {
    try {
      const { username } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: "User not registered" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
