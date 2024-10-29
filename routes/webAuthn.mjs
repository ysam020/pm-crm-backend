import express from "express";
import base64url from "base64url";
import crypto from "crypto";
import UserModel from "../model/userModel.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/api/webauthn/register", async (req, res) => {
  const { username } = req.body;

  try {
    const options = await generateAttestationOptions(username);
    res.json(options);
  } catch (error) {
    console.error("Error generating attestation options:", error);
    res.status(500).json({ error: "Failed to generate attestation options" });
  }
});

router.post("/api/webauthn/verify-registration", async (req, res) => {
  const { username, credential } = req.body;

  try {
    const data = await verifyAttestationResponse(username, credential);
    res.json(data);
  } catch (error) {
    console.error("Error verifying attestation response:", error);
    res.status(500).json({ error: "Failed to verify attestation response" });
  }
});

router.post("/api/webauthn/login", async (req, res) => {
  const { username } = req.body;

  try {
    // Generate assertion options for WebAuthn login
    const options = await generateAssertionOptions(username);
    res.json(options);
  } catch (error) {
    console.error("Error generating assertion options:", error);
    res.status(500).json({ error: "Failed to generate assertion options" });
  }
});

router.post("/api/webauthn/verify-login", async (req, res) => {
  const { username, credential } = req.body;

  try {
    // Verify assertion response during WebAuthn login
    const loginResponse = await verifyAssertionResponse(username, credential);

    res.json(loginResponse);
  } catch (error) {
    console.error("Error verifying assertion response:", error);
    res.status(500).json({ error: "Failed to verify assertion response" });
  }
});

router.post("/api/webauthn/check", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if webAuthnCredentials is defined and is an array
    const isRegistered =
      Array.isArray(user.webAuthnCredentials) &&
      user.webAuthnCredentials.length > 0;

    return res.status(200).json({ isRegistered });
  } catch (error) {
    console.error("Error checking WebAuthn registration:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const authenticateUser = async (
  user,
  res,
  userAgent,
  geolocation,
  ipAddress
) => {
  // Generate JWT token
  const jwtToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      employee_photo: user.employee_photo,
      email: user.email,
      modules: user.modules,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Track session data
  const newSession = {
    sessionID: jwtToken,
    loginAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
    ipAddress: ipAddress,
    userAgent: userAgent,
    latitude: geolocation?.latitude || null,
    longitude: geolocation?.longitude || null,
  };

  // Add the new session to the user's sessions array
  user.sessions.push(newSession);
  await user.save();

  // Send the token in an HTTP-only cookie
  res.cookie("token", jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000, // 1 hour expiration
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  return res.status(200).json({
    message: "Login successful",
    user: {
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      employee_photo: user.employee_photo,
      email: user.email,
      modules: user.modules,
      sessionID: jwtToken,
    },
  });
};

// WebAuthn-only login route
router.post("/api/webauthn-login", async (req, res) => {
  const { username, userAgent, geolocation } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(200).json({ message: "User not registered" });
    }

    // Proceed to authenticate user after successful WebAuthn verification
    await authenticateUser(user, res, userAgent, geolocation, req.ip);
  } catch (err) {
    console.error("WebAuthn login error:", err);
    return res.status(500).json({ message: "WebAuthn login failed" });
  }
});

export default router;
