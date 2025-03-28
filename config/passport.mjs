import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../model/userModel.mjs";
import { loginAlertTemplate } from "../templates/loginAlertTemplate.mjs";
import dotenv from "dotenv";
import { emailQueue } from "./queueConfig.mjs";

dotenv.config();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).select(
        "username password first_name middle_name last_name employee_photo email designation department"
      );

      if (!user) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const currentDate = new Date();

      // Step 1: Check if the account is blocked
      if (user.isBlocked && user.blockedUntil > currentDate) {
        return done(null, false, {
          message: `Your account is blocked until ${user.blockedUntil}. Please try resetting your password.`,
        });
      }

      // Step 2: Check if the password is incorrect
      if (!(await user.isPasswordCorrect(password))) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts === 1) {
          user.firstFailedLoginAt = new Date();
        }

        const attemptsLeft = 3 - user.failedLoginAttempts;

        if (user.failedLoginAttempts >= 3) {
          user.isBlocked = true;
          user.blockedUntil = new Date(currentDate.setHours(23, 59, 59, 999)); // Block until end of day
        }

        await user.save();

        const html = loginAlertTemplate(user.username);

        // Send warning email using Nodemailer
        await emailQueue.add(
          "send-mail",
          {
            from: process.env.EMAIL_FROM, // Sender email address (configured in .env)
            to: user.email, // Recipient email address
            subject: "Login Attempt Warning",
            html: html, // The email HTML template content
          },
          {
            attempts: 2, // Number of retry attempts if job fails
            backoff: {
              type: "exponential",
              delay: 1000, // 1 second initial delay
            },
          }
        );

        let responseMessage = "Username or password didn't match.";
        if (user.isBlocked) {
          responseMessage = `Your account is blocked until ${user.blockedUntil}. Please try resetting your password.`;
        } else {
          responseMessage += ` You have ${attemptsLeft} attempts left before your account is blocked.`;
        }

        return done(null, false, { message: responseMessage });
      }

      // Step 3: Reset failed attempts on successful login
      user.failedLoginAttempts = 0;
      user.isBlocked = false;
      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize user (store only user ID in session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (retrieve full user object from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
