import { Router } from "express";
import { localEmployeeAuthMiddleware } from "../../middleware/auth.middleware";
import {
  loginUser,
  registerEmployee,
} from "../../controllers/dashboard/auth.controllers";

const router = Router();

//  Admin Login & Signup
router.route("/signup").post(registerEmployee);
router.route("/login").post(localEmployeeAuthMiddleware, loginUser);

export default router;
