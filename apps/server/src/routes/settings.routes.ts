import { Router } from 'express';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';
import {
	fetchAddressSettings,
	fetchApiSettings,
	fetchGeneralSettings,
	updateAddressSettings,
	updateGeneralSettings,
} from '../controllers/settings.controllers';
import { storeMiddleware } from '../middleware/store.middleware';

// import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// General Settings
router
	.route('/general')
	.get(jwtAuthMiddleware, storeMiddleware, fetchGeneralSettings)
	.put(jwtAuthMiddleware, storeMiddleware, updateGeneralSettings);

router
	.route('/general/address')
	.get(jwtAuthMiddleware, storeMiddleware, fetchAddressSettings)
	.put(jwtAuthMiddleware, storeMiddleware, updateAddressSettings);

// router
// 	.route('/general/regional')
// 	.get(jwtAuthMiddleware, storeMiddleware, fetchRegionalSettings)
// 	.put(jwtAuthMiddleware, storeMiddleware, updateAddressSettings);

router
	.route('/api-keys')
	.get(jwtAuthMiddleware, storeMiddleware, fetchApiSettings);
// .put(jwtAuthMiddleware, updateStoreGeneralSettings);

export default router;
