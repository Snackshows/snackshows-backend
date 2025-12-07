import { Router } from "express";
import {
  googleOAuthCallback,
  localUserAuthMiddleware,
} from "../../middleware/auth.middleware";
import {
  appGoogleLogin,
  googleCallback,
  loginUser,
  registerUser,
  sendSMS,
  verifyOtpSms,

} from "../../controllers/app/auth.controllers";

const router = Router();

// App Google Authentication
router.route("/google").post(appGoogleLogin);
router.route("/google/callback").get(googleOAuthCallback, googleCallback);
// router.route('/refresh-token').get(generateRefreshToken);

// SMS Authentication
router.route("/sms/send").post(sendSMS);
router.route("/sms/verify").post(verifyOtpSms);

// Instagram Authentication
// router.route("/instagram").post(instagramLogin);
router.route("/signup").post(registerUser);
router.route("/login").post(localUserAuthMiddleware, loginUser);


export default router;
