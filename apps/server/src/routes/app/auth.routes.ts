import { Router } from 'express';
import {
	googleOAuthCallback,
	googleOAuthMiddleware,
	
} from '../../middleware/auth.middleware';
import {
	generateRefreshToken,
	googleCallback,
	loginUser,
    registerUser,
} from '../../controllers/app/auth.controllers';


const router = Router();

// User Authentication
router.route('/google').get(googleOAuthMiddleware,);
router.route('/google/callback').get(googleOAuthCallback, googleCallback);
router.route('/refresh-token').get(generateRefreshToken);








// //  Admin Login & Signup
// router.route("/dashboard/signup").post( registerUser);
// router.route("/dashboard/login").post(localUserAuthMiddleware, loginUser);


export default router;
