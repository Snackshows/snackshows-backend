import { Router } from "express";
import {
  googleOAuthCallback,
} from "../../middleware/auth.middleware";
import {
  appGoogleLogin,
  googleCallback,
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

export default router;
