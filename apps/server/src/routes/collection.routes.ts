import { Router } from 'express';

const router = Router();

// Product routes
router.route('/');
// .post(jwtAuthMiddleware, createCollection)
// .get(jwtAuthMiddleware, getCollection)

router.route('/:collectionId');
// .get(jwtAuthMiddleware, getCollection)
// .put(jwtAuthMiddleware, updateCollection)
// .delete(jwtAuthMiddleware, deleteCollection);

export default router;
