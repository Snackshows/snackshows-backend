import { Request, Response, NextFunction, RequestHandler } from 'express';
import ApiError from '../utils/ApiError';

export const storeMiddleware: RequestHandler = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	const storeId = request.header('X-Store-ID');

	if (!storeId) {
		response.status(400).json(new ApiError(400, 'Missing X-Store-ID header'));
	} else {
		request.storeId = storeId;
		next();
	}
};
