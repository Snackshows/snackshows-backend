import asyncHandler from '../utils/asyncHandler';
import { Request, Response } from 'express';

import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { razorpayCard, RazorPayGateway } from '../gateways/RazorpayGateway';
import { db } from '../db';
import { GatewayConfigs } from '../db/schema';
import { and, eq } from 'drizzle-orm';

export const initiatePayment = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			// const { storeId, amount, currency, orderId, customerId } = request.body;

			const storeConfigs = await db.query.GatewayConfigs.findFirst({
				where: eq(GatewayConfigs.id, '01K14AN7VFYYKNYE8K8CCT6BVP'),
			});

			const razorpayApiKey = storeConfigs?.apiKey;
			const razorpayApiSecret = storeConfigs?.apiSecret;

			if (!razorpayApiKey || !razorpayApiSecret) {
				response.status(404).json(new ApiError(404, 'Store not found'));
			}

			const razorpay = new RazorPayGateway(razorpayApiKey!, razorpayApiSecret!);

			const paymentResponse = await razorpay.createPayment({
				amount: 1000,
				currency: 'INR',
				orderId: 'order_123456789',
				customerId: 'customer_123456789',
				storeId: 'store_123456789',
			});

			console.log('paymentResponse', paymentResponse, razorpayCard);

			response.status(200).send(
				razorpayCard({
					apiKey: razorpayApiKey!,
					amount: 1000 * 100,
					orderId: paymentResponse.transactionId!,
				})
			);
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error fetching product', error));
		}
	}
);

export const verifyPayment = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const razorpayApiKey = process.env.RAZORPAY_API_KEY!;
			const razorpayApiSecret = process.env.RAZORPAY_API_SECRET!;

			const { verifyWebhook } = new RazorPayGateway(
				razorpayApiKey,
				razorpayApiSecret
			);

			if (!verifyWebhook(request)) {
				response.status(400).json(new ApiError(400, 'Invalid webhook'));
			}

			response
				.status(200)
				.json(new ApiResponse(200, {}, 'Payment Succesful successfully'));
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error fetching product', error));
		}
	}
);

///Gateways
export const setupPaymentGateway = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const {
				gateway,
				apiKey,
				apiSecret,
				apiUrl,
				isTestMode,
				active,
			}: {
				gateway: string;
				apiKey: string;
				apiSecret: string;
				apiUrl: string;
				isTestMode: boolean;
				active: boolean;
			} = request.body;
			const storeId = request.storeId!;

			if (gateway.toLowerCase() === 'razorpay') {
				const [configs] = await db
					.insert(GatewayConfigs)
					.values({
						storeId,
						gateway: 'razorpay',
						apiKey,
						apiSecret,
						apiUrl,
						isTestMode,
						active,
					})
					.returning();

				response
					.status(201)
					.json(
						new ApiResponse(
							200,
							configs,
							'Razorpay Payment Gateway Configured successfully'
						)
					);
			} else if (gateway.toLowerCase() === 'stripe') {
				const [configs] = await db
					.insert(GatewayConfigs)
					.values({
						storeId,
						gateway: 'stripe',
						apiKey,
						apiSecret,
						isTestMode,
						active,
					})
					.returning();

				response
					.status(201)
					.json(
						new ApiResponse(
							200,
							configs,
							'Stripe Payment Gateway Configured successfully'
						)
					);
			} else if (gateway.toLowerCase() === 'phonepe') {
				const [configs] = await db
					.insert(GatewayConfigs)
					.values({
						storeId,
						gateway: 'phonepe',
						apiKey,
						apiSecret,
						isTestMode,
						active,
					})
					.returning();

				response
					.status(201)
					.json(
						new ApiResponse(
							200,
							configs,
							'PhonePe Payment Gateway Configured successfully'
						)
					);
			} else if (gateway.toLowerCase() === 'paytm') {
				const [configs] = await db
					.insert(GatewayConfigs)
					.values({
						storeId,
						gateway: 'paytm',
						apiKey,
						apiSecret,
						isTestMode,
						active,
					})
					.returning();

				response
					.status(201)
					.json(
						new ApiResponse(
							200,
							configs,
							'Paytm Payment Gateway Configured successfully'
						)
					);
			}
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error fetching product', error));
		}
	}
);

export const getAllInstalledGateways = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const storeId = request.storeId!;

			const gatewayType = request.params.gateway as string;

			if (gatewayType) {
				const gateway = gatewayType.toLowerCase();

				const gatewayDetails = await db.query.GatewayConfigs.findFirst({
					where:
						eq(GatewayConfigs.storeId, storeId) &&
						eq(
							GatewayConfigs.gateway,
							gateway as 'stripe' | 'razorpay' | 'phonepe' | 'paytm'
						),
				});
				if (!gatewayDetails) {
					response
						.status(204)
						.json(new ApiError(204, 'Gateway Details not found'));
				} else {
					response
						.status(201)
						.json(
							new ApiResponse(
								200,
								gatewayDetails,
								'Fetched installed gateway Details successfully'
							)
						);
				}
			} else {
				const allGateways = await db.query.GatewayConfigs.findMany({
					where: eq(GatewayConfigs.storeId, storeId),
				});

				if (!allGateways) {
					response.status(404).json(new ApiError(404, 'Gateways not found'));
				} else {
					response
						.status(201)
						.json(
							new ApiResponse(
								200,
								allGateways,
								'Fetched all installed gateways successfully'
							)
						);
				}
			}
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error fetching Gateway Details', error));
		}
	}
);

export const updatePaymentGateway = asyncHandler(
	async (request: Request, response: Response) => {
		const {
			id,
			gateway,
			apiKey,
			apiSecret,
			apiUrl,
			isTestMode,
			active,
		}: {
			id: string;
			gateway: string;
			apiKey: string;
			apiSecret: string;
			apiUrl: string;
			isTestMode: boolean;
			active: boolean;
		} = request.body;
		const storeId = request.storeId!;
		try {
			switch (gateway.toLowerCase()) {
				case 'razorpay': {
					const [configs] = await db
						.update(GatewayConfigs)
						.set({
							apiKey: apiKey,
							apiSecret: apiSecret,
							apiUrl: apiUrl,
							isTestMode,
							active: active,
						})
						.where(
							and(
								eq(GatewayConfigs.storeId, storeId),
								eq(GatewayConfigs.id, id)
							)
						)
						.returning();

					response
						.status(200)
						.json(
							new ApiResponse(
								200,
								configs,
								'Razorpay Payment Gateway Configured successfully'
							)
						);
					break;
				}
				case 'stripe': {
					const [configs] = await db
						.update(GatewayConfigs)
						.set({
							apiKey: apiKey,
							apiSecret: apiSecret,
							isTestMode,
							active: active,
						})
						.where(
							and(
								eq(GatewayConfigs.storeId, storeId),
								eq(GatewayConfigs.id, id)
							)
						)
						.returning();

					response
						.status(200)
						.json(
							new ApiResponse(
								200,
								configs,
								'Stripe Payment Gateway Configured successfully'
							)
						);
					break;
				}
				case 'phonepe': {
					const [configs] = await db
						.update(GatewayConfigs)
						.set({
							apiKey: apiKey,
							apiSecret: apiSecret,
							isTestMode,
							active: active,
						})
						.where(
							and(
								eq(GatewayConfigs.storeId, storeId),
								eq(GatewayConfigs.id, id)
							)
						)
						.returning();

					response
						.status(200)
						.json(
							new ApiResponse(
								200,
								configs,
								'PhonePe Payment Gateway Configured successfully'
							)
						);
					break;
				}
				case 'paytm': {
					const [configs] = await db
						.update(GatewayConfigs)
						.set({
							apiKey: apiKey,
							apiSecret: apiSecret,
							isTestMode,
							active: active,
						})
						.where(
							and(
								eq(GatewayConfigs.storeId, storeId),
								eq(GatewayConfigs.id, id)
							)
						)
						.returning();

					response
						.status(200)
						.json(
							new ApiResponse(
								200,
								configs,
								'Paytm Payment Gateway Configured successfully'
							)
						);
					break;
				}
			}
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error updating payment gateway', error));
		}
	}
);

export const updateIsDefaultGateway = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const { id } = request.body;
			const storeId = request.storeId!;

			const isDefaultGateway = await db.query.GatewayConfigs.findFirst({
				where: and(
					eq(GatewayConfigs.storeId, storeId),
					eq(GatewayConfigs.isDefault, true)
				),
			});

			if (isDefaultGateway && isDefaultGateway.id === id) {
				db.transaction(async (tx) => {
					await tx
						.update(GatewayConfigs)
						.set({
							isDefault: false,
						})
						.where(
							eq(GatewayConfigs.storeId, storeId) &&
								eq(GatewayConfigs.id, isDefaultGateway.id)
						);
				});
			} else if (isDefaultGateway && isDefaultGateway.id !== id) {
				db.transaction(async (tx) => {
					await tx
						.update(GatewayConfigs)
						.set({
							isDefault: false,
						})
						.where(
							eq(GatewayConfigs.storeId, storeId) &&
								eq(GatewayConfigs.id, isDefaultGateway.id)
						);

					await tx
						.update(GatewayConfigs)
						.set({
							isDefault: true,
						})
						.where(
							eq(GatewayConfigs.storeId, storeId) && eq(GatewayConfigs.id, id)
						);
				});
			} else {
				db.transaction(async (tx) => {
					await tx
						.update(GatewayConfigs)
						.set({
							isDefault: true,
						})
						.where(
							and(
								eq(GatewayConfigs.storeId, storeId),
								eq(GatewayConfigs.id, id)
							)
						)
						.returning();
				});
			}
			response
				.status(200)
				.json(
					new ApiResponse(
						200,
						{},
						'Default Payment Gateway updated successfully'
					)
				);
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error updating payment gateway', error));
		}
	}
);
