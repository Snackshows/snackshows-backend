import { Router } from "express";
import {
  // deleteUserProfile,
  forgetPassword,
  // getUserNotification,
  // getUserSettings,
  // logoutUser,
  // // registerClient,
  // resetLink,
  // updateUserProfile,
  // updateUserSecurity,
  // updateUserSettings,
  // userProfile,
} from "../../controllers/dashboard/user.controllers";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.route("/").get(jwtAuthMiddleware);
 

export default router;
