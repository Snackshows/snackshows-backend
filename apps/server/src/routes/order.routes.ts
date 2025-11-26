import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import {
	createOrder,
	deleteOrder,
	getOrders,
} from '../controllers/order.controllers';
import { storeMiddleware } from '../middleware/store.middleware';

// import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Order routes
router
	.route('/')
	.post(jwtAuthMiddleware, storeMiddleware, createOrder)
	.get(jwtAuthMiddleware, storeMiddleware, getOrders);

router
	.route('/:orderId')
	.get(jwtAuthMiddleware, storeMiddleware, getOrders)
	.delete(jwtAuthMiddleware, storeMiddleware, deleteOrder);

export default router;
