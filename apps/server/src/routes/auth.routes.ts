import { Router } from 'express';
import {
	googleOAuthCallback,
	googleOAuthMiddleware,
	localCustomerAuthMiddleware,
	localUserAuthMiddleware,
} from '../middleware/auth.middleware';
import {
	generateRefreshToken,
	googleCallback,
	loginUser,
} from '../controllers/auth.controllers';
import {} from '../controllers/user.controllers';
import { storeMiddleware } from '../middleware/store.middleware';

const router = Router();

router.route('/google').get(googleOAuthMiddleware);
router.route('/google/callback').get(googleOAuthCallback, googleCallback);
router.route('/refresh-token').get(generateRefreshToken);
router.route('/user/login').post(localUserAuthMiddleware, loginUser);
router
	.route('/customer/login')
	.post(storeMiddleware, localCustomerAuthMiddleware, loginUser);

export default router;
