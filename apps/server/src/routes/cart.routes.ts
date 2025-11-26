import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import {
	addItemsToCart,
	getCartItems,
	removeCartItem,
	updateCartItem,
} from '../controllers/cart.controllers';

const router = Router();

// Cart routes
router.route('/add').post(jwtAuthMiddleware, addItemsToCart);

router
	.route('/')
	.get(jwtAuthMiddleware, getCartItems)
	.patch(jwtAuthMiddleware, updateCartItem)
	.delete(jwtAuthMiddleware, removeCartItem);
// router.route('/:id').get(jwtAuthMiddleware, getCart);

// router.route('/remove').post(jwtAuthMiddleware, removeCart);

// router
// 	.route('/:categoryId')
// 	.get(jwtAuthMiddleware, getCategories)
// 	.put(jwtAuthMiddleware, updateCategory)
// 	.delete(jwtAuthMiddleware, deleteCategory);

export default router;
