import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { store } from '../db/schema';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { apiKey } from '../db/schema/store';

export const fetchGeneralSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const storeId = request.storeId!;
		try {
			const storeSettings = await db.query.store.findFirst({
				where: eq(store.id, storeId),
				columns: {
					id: true,
					name: true,
					description: true,
					domain: true,
				},
			});

			if (!storeSettings) {
				response.status(404).json(new ApiError(404, 'Store not found'));
			}
			response
				.status(200)
				.json(
					new ApiResponse(
						200,
						storeSettings,
						'Store settings fetched successfully'
					)
				);
		} catch (error) {
			response
				.status(500)
				.json(new ApiError(500, 'Error updating store settings', error));
		}
	}
);

export const updateGeneralSettings = asyncHandler(
	async (request: Request, response: Response): Promise<void> => {
		const storeId = request.storeId!;
		const { name, description, domain } = request.body;

		try {
			const updatedStore = await db
				.update(store)
				.set({
					name,
					description,
					domain,
				})
				.where(eq(store.id, storeId))
				.returning();

			if (!updatedStore.length) {
				response.status(404).json(new ApiError(404, 'Store not found'));
				return;
			}

			response
				.status(200)
				.json(
					new ApiResponse(200, updatedStore[0], 'General settings updated')
				);
		} catch (error) {
			response
				.status(500)
				.json(new ApiError(500, 'Failed to update settings', error));
		}
	}
);

export const fetchAddressSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const storeId = request.storeId!;
		try {
			const storeSettings = await db.query.store.findFirst({
				where: eq(store.id, storeId),
				columns: {
					id: true,
					address1: true,
					address2: true,
					country: true,
					city: true,
					zip: true,
					countryCode: true,
					phone: true,
				},
			});

			if (!storeSettings) {
				response.status(404).json(new ApiError(404, 'Store not found'));
			}
			response
				.status(200)
				.json(
					new ApiResponse(
						200,
						storeSettings,
						'Store settings fetched successfully'
					)
				);
		} catch (error) {
			response
				.status(500)
				.json(new ApiError(500, 'Error updating store settings', error));
		}
	}
);

export const updateAddressSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const storeId = request.storeId!;
		const { address1, address2, city, country, zip, countryCode, phone } =
			request.body;
		try {
			const storeSettings = await db
				.update(store)
				.set({
					address1,
					address2,
					city,
					country,
					zip,
					countryCode,
					phone,
				})
				.where(eq(store.id, storeId))
				.returning();

			if (!storeSettings) {
				response.status(404).json(new ApiError(404, 'Store not found'));
			}

			response
				.status(200)
				.json(
					new ApiResponse(
						200,
						storeSettings,
						'Store settings fetched successfully'
					)
				);
		} catch (error) {
			response
				.status(500)
				.json(new ApiError(500, 'Error updating store settings', error));
		}
	}
);

// export const fetchRegionalSettings = asyncHandler(
// 	async (request: Request, response: Response) => {

// 	}
// );

// export const updateStoreGeneralSettings = asyncHandler(
// 	async (request: Request, response: Response): Promise<void> => {
// 		const storeId = request.params.storeId;
// 					zip: true,
// 					countryCode: true,
// 					phone: true,
// 				},
// 			});

// 			try{
// 			if (!storeSettings) {
// 				response.status(404).json(new ApiError(404, 'Store not found'));
// 			}
// 			response
// 				.status(200)
// 				.json(
// 					new ApiResponse(
// 						200,
// 						storeSettings,
// 						'Store settings fetched successfully'
// 					)
// 				);
// 		} catch (error) {
// 			response
// 				.status(500)
// 				.json(new ApiError(500, 'Error updating store settings', error));
// 		}
// 	}
// );

export const fetchApiSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const id = request.storeId!;

		try {
			const storeSettings = await db.query.store.findFirst({
				where: eq(store.id, id),
				columns: {
					id: true,
				},
			});

			if (!storeSettings) {
				response.status(404).json(new ApiError(404, 'Store not found'));
			}

			const apiKeys = await db.query.apiKey.findMany({
				where: eq(apiKey.storeId, id),
			});
			response.status(200).json(
				new ApiResponse(
					200,
					{
						storeId: storeSettings?.id,
						apiKeys,
					},
					'Store settings fetched successfully'
				)
			);
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error updating store settings', error));
		}
	}
);
