import express from "express";
import verifySession from "../middlewares/verifySession.mjs";
import credentialCheck from "../controllers/webauthn/credentialCheck.mjs";
import disableWebAuthn from "../controllers/webauthn/disableWebAuthn.mjs";
import getCredentials from "../controllers/webauthn/getCredentials.mjs";
import initiateLogin from "../controllers/webauthn/initiateLogin.mjs";
import initiateRegistration from "../controllers/webauthn/initiateRegistration.mjs";
import verifyLogin from "../controllers/webauthn/verifyLogin.mjs";
import verifyRegistration from "../controllers/webauthn/verifyRegistration.mjs";
import webAuthnLogin from "../controllers/webauthn/webAuthnLogin.mjs";

const router = express.Router();

router.post("/api/webauthn-credential-check", credentialCheck);
router.get("/api/disable-webauthn", verifySession, disableWebAuthn);
router.post("/api/get-credentials", getCredentials);
router.post("/api/webauthn-login-options", initiateLogin);
router.get("/api/webauthn-register", verifySession, initiateRegistration);
router.post("/api/webauthn-verify-login", verifyLogin);
router.post(
  "/api/webauthn-verify-registration",
  verifySession,
  verifyRegistration
);
router.post("/api/webauthn-login", webAuthnLogin);

export default router;
