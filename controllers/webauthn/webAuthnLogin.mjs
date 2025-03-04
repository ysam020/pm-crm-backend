import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const webAuthnLogin = (req, res, next) => {
  passport.authenticate("webauthn", async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Authentication failed" });
    }

    req.logIn(user, async (err) => {
      if (err) return next(err);

      const { geolocation, userAgent } = req.body;

      // Store session details
      req.session.userAgent = userAgent;
      req.session.latitude = geolocation?.latitude;
      req.session.longitude = geolocation?.longitude;
      req.session.loginAt = new Date();
      req.session.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Send successful login response
      return res.status(200).json({
        message: "Login successful",
        user: {
          username: user.username,
          rank: user.rank,
          firstName: user.first_name,
          middleName: user.middle_name,
          lastName: user.last_name,
          employeePhoto: user.employee_photo,
          email: user.email,
          modules: user.modules,
          full_name: user.getFullName(),
        },
      });
    });
  })(req, res, next);
};

export default webAuthnLogin;
