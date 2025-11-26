import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

import { getInventory } from '../controllers/inventory.controllers';

const router = Router();

// Inventory routes
router
	.route('/')
	// .post(jwtAuthMiddleware, createInventory)
	.get(jwtAuthMiddleware, getInventory);

// router
//     .route('/:productId')
//     .get(jwtAuthMiddleware, getProductById)
//     .put(jwtAuthMiddleware, updateProduct)
//     .delete(jwtAuthMiddleware, deleteProduct);

export default router;
