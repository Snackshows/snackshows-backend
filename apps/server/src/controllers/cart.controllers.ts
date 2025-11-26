import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { eq, InferSelectModel } from 'drizzle-orm';
import { db } from '../db';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { cart, cartItems, customer, store } from '../db/schema';

export const addItemsToCart = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof customer>;
		const storeId = request.query.storeId as string;
		const { productId, quantity } = request.body;

		try {
			const cartExists = await db.query.cart.findFirst({
				where: eq(cart.storeId, storeId) && eq(cart.customerId, authUser.id),
			});

			console.log('Cart Exists', cartExists);
			if (cartExists) {
				const [cartItemsValues] = await db
					.insert(cartItems)
					.values({
						cartId: cartExists.id,
						productId,
						quantity,
					})
					.returning();

				console.log('Cart Items Values', cartItemsValues);
				response
					.status(200)
					.json(
						new ApiResponse(200, cartItemsValues, 'New Item Added in Cart')
					);
			} else {
				const [createdCart] = await db
					.insert(cart)
					.values({
						storeId,
						customerId: authUser.id,
					})
					.returning();
				console.log('Created Cart', createdCart);

				const [cartItemsValues] = await db
					.insert(cartItems)
					.values({
						cartId: createdCart.id,
						productId,
						quantity,
					})
					.returning();
				response
					.status(200)
					.json(
						new ApiResponse(200, cartItemsValues, 'New Item Added in Cart')
					);
			}
		} catch (error) {
			console.log(error);
			response.status(500).json(new ApiError(500, 'Error Happens', error));
		}
	}
);

export const getCartItems = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const authUser = request.user as InferSelectModel<typeof customer>;
			const storeId = request.query.storeId as string;
			const cartId = request.query.cartId as string;

			if (!cartId) {
				const storeDetails = await db.query.store.findFirst({
					where: eq(store.id, storeId),
					with: {
						carts: true,
					},
				});

				if (!storeDetails) {
					response.status(400).json(new ApiError(400, 'Store not found'));
				} else {
					const cartDetails = await db.query.cart.findFirst({
						where:
							eq(cart.storeId, storeId) && eq(cart.customerId, authUser.id),
					});

					if (!cartDetails) {
						response.status(400).json(new ApiError(400, 'Cart not found'));
					} else {
						const cartItemsDetails = await db.query.cartItems.findMany({
							where: eq(cartItems.cartId, cartDetails?.id),
							with: {
								product: true,
								cart: true,
							},
						});

						response
							.status(200)
							.json(
								new ApiResponse(200, cartItemsDetails, 'Cart Items fetched')
							);
					}
				}
			} else {
				const cartItemsDetails = await db.query.cartItems.findMany({
					where: eq(cartItems.cartId, cartId),
					with: {
						product: true,
						cart: true,
					},
				});

				const cartDetails = cartItemsDetails.map((entry) => ({
					id: entry.id,
					quantity: entry.quantity,
					storeId: entry.product?.storeId,
					description: entry.product?.description,
					status: entry.product?.status,
					categoryId: entry.product?.categoryId,
					title: entry.product?.title,
					isVariantEnabled: entry.product?.isVariantEnabled,
					seoTitle: entry.product?.seoTitle,
					seoDescription: entry.product?.seoDescription,
					seoKeywords: entry.product?.seoKeywords,
					seoScore: entry.product?.seoScore,
					createdAt: entry.cart?.createdAt,
					updatedAt: entry.cart?.updatedAt,
				}));

				response
					.status(200)
					.json(new ApiResponse(200, cartDetails, 'Cart Items fetched'));
			}
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const updateCartItem = asyncHandler(
	async (request: Request, response: Response) => {
		const { quantity } = request.body;

		const cartItemId = request.query.itemId as string;
		const cartId = request.query.cartId as string;
		console.log('Cart Item Id', cartItemId);
		console.log('Cart Id', cartId);

		try {
			const [updatedCart] = await db
				.update(cartItems)
				.set({
					quantity,
				})
				.where(eq(cartItems.id, cartItemId))
				.returning();
			console.log('Updated Cart', updatedCart);
			response
				.status(200)
				.json(new ApiResponse(200, updatedCart, 'Cart is Updated'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const removeCartItem = asyncHandler(
	async (request: Request, response: Response) => {
		const cartItemId = request.query.itemId as string;
		const cartId = request.query.cartId as string;
		console.log('Cart Item Id', cartItemId);
		console.log('Cart Id', cartId);

		try {
			const [deletedCartItem] = await db
				.delete(cartItems)
				.where(eq(cartItems.cartId, cartId) && eq(cartItems.id, cartItemId))
				.returning();
			response
				.status(200)
				.json(new ApiResponse(200, deletedCartItem, 'Cart Item is Deleted'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);
