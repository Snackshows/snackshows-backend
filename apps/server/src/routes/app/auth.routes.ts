import { Router } from "express";
import {
  googleOAuthCallback,
  googleOAuthMiddleware,
} from "../../middleware/auth.middleware";
import {
  appGoogleLogin,
  googleCallback,
  sendSMS,
  verifySMS,
} from "../../controllers/app/auth.controllers";

const router = Router();

// Web Google Authentication
// router.route('/google/web').get(googleOAuthMiddleware,);
// router.route('/google/callback').get(googleOAuthCallback, googleCallback);
// router.route('/refresh-token').get(generateRefreshToken);

// App Google Authentication
router.route("/google").post(appGoogleLogin);
router.route("/google/callback").get(googleOAuthCallback, googleCallback);
// router.route('/refresh-token').get(generateRefreshToken);

// SMS Authentication
router.route("/sms/send").post(sendSMS);
router.route("/sms/verify").post(verifySMS);

export default router;
