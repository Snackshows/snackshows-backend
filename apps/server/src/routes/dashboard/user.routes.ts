import { Router } from "express";
import {

  
  createNewUser,
  getAllUsers,
  getUserDetails,
 
} from "../../controllers/dashboard/user.controllers";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();
router.get("/:userId", jwtAuthMiddleware, getUserDetails);

router
  .route("/")
  .get(jwtAuthMiddleware, getAllUsers)
  .post(jwtAuthMiddleware, createNewUser);


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
