import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	updateProduct,
} from '../controllers/product.controllers';

const router = Router();

// Product routes
router
	.route('/')
	.post(jwtAuthMiddleware, createProduct)
	.get(jwtAuthMiddleware, getAllProducts);

router
	.route('/:productId')
	.get(jwtAuthMiddleware, getProductById)
	.put(jwtAuthMiddleware, updateProduct)
	.delete(jwtAuthMiddleware, deleteProduct);

export default router;
