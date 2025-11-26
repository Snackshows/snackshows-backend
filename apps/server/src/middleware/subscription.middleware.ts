import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import redis from '../lib/redis'; // your Redis connection
import { db } from '../db';
import { subscription } from '../db/schema';
import { eq } from 'drizzle-orm';

interface SubscriptionMiddleware {
	allowedTiers: ('basic' | 'grow' | 'scale')[];
}

export const subscriptionMiddleware = ({
	allowedTiers,
}: SubscriptionMiddleware) => {
	return async (request: Request, response: Response, next: NextFunction) => {
		const storeId = request.header('X-Store-ID');
		if (!storeId) {
			response.status(400).json(new ApiError(400, 'Missing X-Store-ID header'));
		}

		// 1. Check cache

		const subscriptionData = await redis.get(`subscription:store:${storeId}`);

		if (!subscriptionData) {
			// 2. If not found in cache → fetch from DB
			const subscriptionQuery = await db.query.subscription.findFirst({
				where: eq(subscription.storeId, storeId!),
			});

			if (!subscriptionQuery || subscriptionQuery.status !== 'active') {
				response
					.status(403)
					.json(
						new ApiError(
							403,
							'Your are under trial period. Please upgrade your plan.'
						)
					);
			} else if (
				!allowedTiers.includes(
					subscriptionQuery!.tier as 'basic' | 'grow' | 'scale'
				)
			) {
				response
					.status(403)
					.json(new ApiError(403, 'Your plan is not allowed'));
			} else {
				const subscriptionData = {
					tier: subscriptionQuery!.tier,
					active: subscriptionQuery!.status === 'active',
					expiresAt: new Date(
						subscriptionQuery!.currentPeriodEnd
					).toISOString(),
				};

				// Save to Redis with TTL (e.g., 10 minutes)
				await redis.set(
					`subscription:store:${storeId}`,
					JSON.stringify(subscriptionData)
				);
				await redis.expire(`subscription:store:${storeId}`, 600); //

				request.subscription = subscriptionData;
				request.storeId = storeId;

				next();
			}
		} else {
			const subscription = JSON.parse(subscriptionData);
			request.subscription = subscription;
			request.storeId = storeId;

			next();
		}

		// 3. Attach subscription info to request
	};
};
