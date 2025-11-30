import { Router } from "express";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
//   updateCategory,
} from "../../controllers/dashboard/category.controllers";

const router = Router();

router.route("/create").post(jwtAuthMiddleware, createCategory);

router
  .route("/")
  .get(jwtAuthMiddleware, getCategories)
  .put(jwtAuthMiddleware, updateCategory)

router
  .route("/:categoryId")
  .get(jwtAuthMiddleware, getCategories)
  .delete(jwtAuthMiddleware, deleteCategory);

export default router;
