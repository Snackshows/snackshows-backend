import { Router } from "express";
import {
  createVideoSeries,
  deleteVideoSeries,
  getAllVideoSeries,
  getVideoSeriesById,
  updateVideoSeries,
} from "../../controllers/dashboard/videoSeries.controllers";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router
  .route("/")
  .post(jwtAuthMiddleware, createVideoSeries)
  .get(jwtAuthMiddleware, getAllVideoSeries).put(jwtAuthMiddleware,updateVideoSeries)

router.route("/:id").get(jwtAuthMiddleware, getVideoSeriesById).delete(jwtAuthMiddleware,deleteVideoSeries)

export default router;
