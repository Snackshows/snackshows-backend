import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from '../controllers/category.controllers';

const router = Router();

// Product routes
router
	.route('/')
	.post(jwtAuthMiddleware, createCategory)
	.get(jwtAuthMiddleware, getCategories);

router
	.route('/:categoryId')
	.get(jwtAuthMiddleware, getCategories)
	.put(jwtAuthMiddleware, updateCategory)
	.delete(jwtAuthMiddleware, deleteCategory);

export default router;
