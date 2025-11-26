import { Router } from 'express';

import {
	getAllInstalledGateways,
	initiatePayment,
	setupPaymentGateway,
	updateIsDefaultGateway,
	updatePaymentGateway,
	verifyPayment,
} from '../controllers/payment.controllers';
import { storeMiddleware } from '../middleware/store.middleware';

// import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Product routes
router.route('/').get(initiatePayment);
router.route('/create').get(initiatePayment);
router.route('/verifyPayment').post(verifyPayment);

//Gateways
router.route('/gateways/setup').post(storeMiddleware, setupPaymentGateway);
router
	.route('/gateways')
	.get(storeMiddleware, getAllInstalledGateways)
	.put(storeMiddleware, updatePaymentGateway)
	.patch(storeMiddleware, updateIsDefaultGateway);
router
	.route('/gateways/:gateway')
	.get(storeMiddleware, getAllInstalledGateways);

export default router;
