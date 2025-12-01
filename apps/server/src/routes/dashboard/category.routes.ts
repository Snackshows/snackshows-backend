import { Router } from "express";
import { jwtAuthMiddleware } from "../../middleware/auth.middleware";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateIsActive,
  //   updateCategory,
} from "../../controllers/dashboard/category.controllers";

const router = Router();

router.route("/create").post(jwtAuthMiddleware, createCategory);

router
  .route("/")
  .get(jwtAuthMiddleware, getCategories)
  
  .put(jwtAuthMiddleware, updateCategory)
  .patch(jwtAuthMiddleware, updateIsActive);


  router.route("/:id").delete(jwtAuthMiddleware, deleteCategory);
export default router;
