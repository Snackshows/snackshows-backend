import { Router } from "express";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";
import { getHomePageData } from "../../controllers/app/home.controllers";

const router = Router();

router
  .route("/")
  .get(jwtAuthMiddleware, getHomePageData)

export default router;
