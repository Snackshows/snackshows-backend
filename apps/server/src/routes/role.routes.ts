import { Router } from 'express';

import { createRole } from '../controllers/role.controllers';

const router = Router();

router.route('/create').post(createRole);
// router.route('/google/callback').get(googleOAuthCallback, googleCallback);

export default router;
