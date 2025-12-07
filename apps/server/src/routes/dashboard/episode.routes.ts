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
import { createEpisode, getAllEpisodes } from "../../controllers/dashboard/episode.controllers";
// import { getAllEpisode } from "../../controllers/dashboard/episode.controllers";

const router = Router();

router.route("/").post(jwtAuthMiddleware,createEpisode)
.get(jwtAuthMiddleware,getAllEpisodes)



// router
//   .route("/profile")
//   .get(jwtAuthMiddleware, userProfile)
//   .put(jwtAuthMiddleware, updateUserProfile)
//   .delete(jwtAuthMiddleware, deleteUserProfile);

// router.route("/security").patch(jwtAuthMiddleware, updateUserSecurity);

// router
//   .route("/settings")
//   .get(jwtAuthMiddleware, getUserSettings)
//   .put(jwtAuthMiddleware, updateUserSettings);

// router.route("/notification").get(jwtAuthMiddleware, getUserNotification);
// router.route("/forget-password").post(forgetPassword);
// router.route("/reset-link").post(resetLink);
// router.route("/logout").post(logoutUser);

export default router;
