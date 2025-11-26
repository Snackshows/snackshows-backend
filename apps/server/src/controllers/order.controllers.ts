import { Request, Response } from 'express';
import { db } from '../db';
import { order, orderItems } from '../db/schema/order';
import { eq, and, InferSelectModel } from 'drizzle-orm';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

import { razorpayCard, RazorPayGateway } from '../gateways/RazorpayGateway';
import { PaymentResponse } from '../gateways/types';
import { GatewayConfigs } from '../db/schema';

import { customer } from '../db/schema';

// Create Order Request
export const createOrder = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof customer>;
		const {
			// customerId,
			// cartId,

			// contactId,
			name,
			products,
			shippingAddress,
			billingAddress,
			// tags,
			// note,
			currency,
			totalAmount,
			// subtotalPrice,
			// paymentMethod,
			// additionalPrice,
			// totalDiscounts,
			// totalLineItemsPrice,
			// totalTax,
			// totalTaxRecovered,
			// totalWeight,
			// currentTotalDiscounts,
			// currentTotalPrice,
			// currentSubtotalPrice,
			// currentTotalTax,
		}: {
			storeId: string;
			customerId: string;
			cartId: string;
			contactId: string;
			name: string;
			products: Array<{
				productId: string;
				quantity: number;
			}>;
			shippingAddress: {
				phone: string;
				company: string;
				name: string;
				address1: string;
				address2: string;
				city: string;
				province: string;
				country: string;
				zip: string;
			};
			billingAddress: {
				phone: string;
				company: string;
				name: string;
				address1: string;
				address2: string;
				city: string;
				province: string;
				country: string;
				zip: string;
			};
			tags: string[];
			note: string;
			currency: string;
			totalAmount: number;
			subtotalPrice: number;
			paymentMethod: string;
			additionalPrice: number;
			totalDiscounts: number;
			totalLineItemsPrice: number;
			totalTax: number;
			totalTaxRecovered: number;
			totalWeight: number;
			currentTotalDiscounts: number;
			currentTotalPrice: number;
			currentSubtotalPrice: number;
			currentTotalTax: number;
			shippedAt: string;
		} = request.body;

		const storeId = request.storeId!;

		if (!storeId) {
			response.status(400).json(new ApiError(400, 'storeId is required'));
		}
		try {
			db.transaction(async (trx) => {
				const [createOrder] = await trx
					.insert(order)
					.values({
						storeId: storeId, // Make sure this is defined
						customerId: authUser.id, // Assuming authUser contains the customer ID
						// Generate a unique order name
						// Uncomment and provide other required fields
						name: name,
						// contactId: contactId,
						shippingAddressPhone: shippingAddress?.phone || '',
						shippingAddressName: shippingAddress?.name || '',
						shippingAddressAddress1: shippingAddress?.address1 || '',
						shippingAddressCity: shippingAddress?.city || '',
						shippingAddressProvince: shippingAddress?.province || '',
						shippingAddressCountry: shippingAddress?.country || '',
						shippingAddressZip: shippingAddress?.zip || '',
						// Include billing address if different
						billingAddressPhone:
							billingAddress?.phone || shippingAddress?.phone || '',
						billingAddressName:
							billingAddress?.name || shippingAddress?.name || '',
						// ... other billing address fields
					})
					.returning();

				const orderItemsData = products.map((p) => ({
					orderId: createOrder.id,
					productId: p.productId,
					quantity: p.quantity,
					priceAtPurchase: 232323,
				}));

				await trx.insert(orderItems).values(orderItemsData).returning();

				// 🔔 Initiate payment using store's default payment gateway
				const defaultGateway = await trx.query.GatewayConfigs.findFirst({
					where: and(
						eq(GatewayConfigs.storeId, storeId),
						eq(GatewayConfigs.isDefault, true)
					),
					with: {
						store: true,
					},
				});

				if (!defaultGateway) {
					response
						.status(404)
						.json(new ApiError(404, 'Default payment gateway not configured'));
				} else if (defaultGateway.store.isTestMode) {
					response
						.status(404)
						.json(
							new ApiError(
								404,
								'Test Mode is Active No Payment will be Initiated, Please Deactivate first'
							)
						);
				} else {
					let paymentResponse: PaymentResponse | null = null;

					switch (defaultGateway.gateway) {
						case 'razorpay': {
							const razorpay = new RazorPayGateway(
								defaultGateway.apiKey,
								defaultGateway.apiSecret
							);
							paymentResponse = await razorpay.createPayment({
								storeId,
								amount: totalAmount,
								currency: currency || 'INR',
								orderId: createOrder.id,
								customerId: authUser.id,
							});
							break;
						}
						// TODO: Add additional gateways (stripe, phonepe, etc.)
						default: {
							throw new ApiError(400, 'Unsupported payment gateway');
						}
					}

					// Optionally: store the transaction details in DB here

					// response
					// 	.status(201)
					// 	.json(
					// 		new ApiResponse(
					// 			200,
					// 			{ orderItems: createOrderItems, payment: paymentResponse },
					// 			'new order created successfully'
					// 		)
					// 	);

					response.status(200).send(
						razorpayCard({
							apiKey: defaultGateway.apiKey!,
							amount: totalAmount * 100,
							orderId: paymentResponse.transactionId!,
						})
					);
				}
			});
		} catch (error) {
			response.status(500).json(new ApiError(500, 'Error Happens', error));
		}
	}
);

// // Get All orders
export const getOrders = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const authUser = request.user as InferSelectModel<typeof customer>;

			const orderId = request.params.orderId;

			if (orderId) {
				const customerOrders = await db.query.customer.findFirst({
					where: eq(customer.id, authUser.id),
					with: {
						orders: {
							with: {
								items: {
									with: {
										product: true,
									},
								},
							},
						},
					},
				});

				const order = customerOrders?.orders.find(
					(order) => order.id === orderId
				);

				// Build structured order details response

				if (!order) {
					response.status(404).json(new ApiError(404, 'Order not found'));
				} else {
					const orderDetails = {
						id: order?.id,
						name: order?.name,
						items: order.items.map((item) => ({
							id: item.id,
							// thumbnail: item.product?.images?.[0]?.url ?? null,
							productId: item.productId,
							quantity: item.quantity,
							price: item.priceAtPurchase,
							currency: order.currency,
						})),

						shippingDetails: {
							deliveredTo: order.shippingAddressName,
							deliveredAt: order.shippedAt,
						},
						customerDetails: {
							name: order?.name,
							contactId: order.customerId,
							shippingAddress: {
								address1: order.shippingAddressAddress1,
								address2: order.shippingAddressAddress2,
								city: order.shippingAddressCity,
								province: order.shippingAddressProvince,
								country: order.shippingAddressCountry,
								zip: order.shippingAddressZip,
							},
							billingAddress: {
								address1: order.billingAddressAddress1,
								address2: order.billingAddressAddress2,
								city: order.billingAddressCity,
								province: order.billingAddressProvince,
								country: order.billingAddressCountry,
								zip: order.billingAddressZip,
							},
						},
						paymentDetails: {},
						subtotal: order.subtotalPrice,
						discount: order.totalDiscounts,
						shipping: order.additionalPrice,
						total: order.totalPrice,
					};

					response
						.status(200)
						.json(
							new ApiResponse(
								200,
								orderDetails,
								'Order details fetched successfully'
							)
						);
				}
			} else {
				const customerOrders = await db.query.customer.findFirst({
					where: eq(customer.id, authUser.id),
					with: {
						orders: {
							with: {
								items: {
									with: {
										product: true,
									},
								},
							},
						},
					},
				});

				response
					.status(200)
					.json(
						new ApiResponse(
							200,
							customerOrders?.orders,
							'Orders fetched successfully'
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

// Update product
// export const updateOrderData = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		const {
// 			storeId,
// 			title,
// 			description,
// 			categoryId,
// 			status,
// 			media,
// 			isVariantEnabled,
// 			variant,
// 			options,
// 			variants,
// 			seo,
// 		}: {
// 			storeId: string;
// 			title: string;
// 			description: string;
// 			categoryId: string;
// 			status: string;
// 			media: { mediaId: string; index: number }[];
// 			isVariantEnabled: boolean;
// 			variant: {
// 				variantId: number;
// 				sku: string;
// 				barcode: string;
// 				price: number;
// 				comparedAtPrice: number;
// 				costPerItem: number;
// 				manageInventory: boolean;
// 				inventoryQuantity: number;
// 				requiresShipping: boolean;
// 				weight: number;
// 				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
// 				option1: string | null;
// 				option2: string | null;
// 				option3: string | null;
// 			};
// 			options: {
// 				name: string;
// 				position: number;
// 				values: {
// 					value: string;
// 					position: number;
// 				}[];
// 			}[];
// 			variants: {
// 				variantId: number;
// 				sku: string;
// 				barcode: string;
// 				price: number;
// 				comparedAtPrice: number;
// 				costPerItem: number;
// 				manageInventory: boolean;
// 				inventoryQuantity: number;
// 				requiresShipping: boolean;
// 				weight: number;
// 				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
// 				option1: string | null;
// 				option2: string | null;
// 				option3: string | null;
// 			}[];
// 			seo: {
// 				title: string;
// 				description: string;
// 				keywords: string;
// 			};
// 		} = request.body;
// 		try {
// 			const productId = request.params.productId as string;
// 			console.log('productId', productId, media);

// 			console.log('Body---->', request.body);

// 			// Validate required fields
// 			if (!title) {
// 				response.status(400).json({ message: 'Title is required' });
// 			}

// 			await db.transaction(async (trx) => {
// 				const [productResult] = await trx
// 					.update(product)
// 					.set({
// 						storeId,
// 						categoryId,
// 						title: title.trim(), // Trim whitespace from title
// 						description,
// 						status: status?.toLowerCase() === 'active' ? 'active' : 'draft',
// 						isVariantEnabled,
// 						seoTitle: seo?.title,
// 						seoDescription: seo?.description,
// 						seoKeywords: seo?.keywords,
// 					})
// 					.where(eq(product.id, productId))
// 					.returning();

// 				if (!productResult) {
// 					response.status(404).json({ message: 'Product not found' });
// 				}

// 				///Update the media
// 				await trx
// 					.delete(productMedia)
// 					.where(eq(productMedia.productId, productId));

// 				for (const { index, mediaId } of media) {
// 					await trx
// 						.insert(productMedia)
// 						.values({ index, mediaId, productId })
// 						.returning()
// 						.then((result) => {
// 							console.log('mediaId===>', result);
// 							// mediaData.push(...result);
// 						});
// 				}

// 				if (!isVariantEnabled && !options.length && !variants.length) {
// 					await trx
// 						.delete(productVariant)
// 						.where(eq(productVariant.productId, productId));

// 					const options = await trx.query.productOptions.findMany({
// 						where: eq(productOptions.productId, productId),
// 					});

// 					await Promise.all(
// 						options.map((option) =>
// 							trx
// 								.delete(productOptionsValues)
// 								.where(eq(productOptionsValues.optionId, option.id))
// 						)
// 					);
// 					await trx
// 						.delete(productOptions)
// 						.where(eq(productOptions.productId, productId));

// 					const variantResult = await trx
// 						.insert(productVariant)
// 						.values({
// 							productId: productId,
// 							sku: variant.sku,
// 							barcode: variant.barcode,
// 							price: variant.price,
// 							comparedAtPrice: variant.comparedAtPrice,
// 							costPerItem: variant.costPerItem,
// 							manageInventory: variant.manageInventory,
// 							inventoryQuantity: variant.inventoryQuantity,
// 							requiresShipping: variant.requiresShipping,
// 							weight: variant.weight,
// 							weightUnit: variant.weightUnit,
// 							option1: null,
// 							option2: null,
// 							option3: null,
// 						})
// 						.returning();

// 					response.status(201).json(
// 						new ApiResponse(
// 							200,
// 							{
// 								...productResult,

// 								variant: variantResult,
// 							},
// 							'Product created successfully'
// 						)
// 					);
// 				}

// 				if (isVariantEnabled && options.length && variants.length) {
// 					await trx
// 						.delete(productVariant)
// 						.where(eq(productVariant.productId, productId));

// 					const deleteOptions = await trx.query.productOptions.findMany({
// 						where: eq(productOptions.productId, productId),
// 					});

// 					await Promise.all(
// 						deleteOptions.map((option) =>
// 							trx
// 								.delete(productOptionsValues)
// 								.where(eq(productOptionsValues.optionId, option.id))
// 						)
// 					);
// 					await trx
// 						.delete(productOptions)
// 						.where(eq(productOptions.productId, productId));
// 					// 🔴 Update multi Variant
// 					const optionsResult = await trx
// 						.insert(productOptions)
// 						.values(
// 							options.map((option) => {
// 								return {
// 									productId: productId,
// 									name: option.name,
// 									position: option.position,
// 								};
// 							})
// 						)
// 						.returning();

// 					console.log('Options Result--->', optionsResult);
// 					const flatOptions = optionsResult.flat();

// 					// 🔴 Insert option values
// 					await Promise.all(
// 						options.flatMap((option, i) => {
// 							const optionId = flatOptions[i].id;
// 							return option.values.map((value) =>
// 								trx.insert(productOptionsValues).values({
// 									optionId,
// 									value: value.value,
// 									position: value.position,
// 								})
// 							);
// 						})
// 					);

// 					const variantResult = await trx
// 						.insert(productVariant)
// 						.values(
// 							variants.map((variant) => ({
// 								productId: productId,
// 								sku: variant.sku,
// 								barcode: variant.barcode,
// 								price: variant.price,
// 								costPerItem: variant.costPerItem,
// 								comparedAtPrice: variant.comparedAtPrice,
// 								manageInventory: variant.manageInventory,
// 								inventoryQuantity: variant.inventoryQuantity,
// 								requiresShipping: variant.requiresShipping,
// 								weight: variant.weight,
// 								weightUnit: variant.weightUnit,
// 								option1: variant.option1 ? variant.option1 : null,
// 								option2: variant.option2 ? variant.option2 : null,
// 								option3: variant.option3 ? variant.option3 : null,
// 							}))
// 						)
// 						.returning();
// 					response.status(201).json(
// 						new ApiResponse(
// 							200,
// 							{
// 								...productResult,

// 								variant: variantResult,
// 								options: optionsResult,
// 							},
// 							'Product created successfully'
// 						)
// 					);
// 				}

// 				// console.log('mediaData===>', mediaData);
// 			});
// 		} catch (error) {
// 			console.log(error);
// 			response.status(400).json({ message: 'Error updating product', error });
// 		}
// 	}
// );

// export const updateProductInOrder = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		const authUser = request.user as InferSelectModel<typeof customer>;
// 		const orderId = request.params.orderId;
// 		const {

// 			products,
// 		}: {

// 			products: Array<{
// 				productId: string;
// 				quantity: number;
// 			}>;
// 		} = request.body;

// 		try {
// 			db.transaction(async (trx) => {

// 				const orderItemsData = await trx.query.orderItems.findMany({
// 					where: eq(orderItems.orderId, orderId),
// 				});

// 				// const orderItemsData = products.map((p) => ({
// 				// 	productId: p.productId,
// 				// 	quantity: p.quantity,
// 				// }));

// 				const updatedData = orderItemsData
// 					products.map((p) => ({
// 						orderId: orderId,
// 						productId: p.productId,
// 						quantity: p.quantity,
// 						priceAtPurchase: 232323,
// 					}))

// 				const createOrderItems = await trx
// 					.update(orderItems)
// 					.set({
// 						quantity: orderItemsData.quantity,
// 					})
// 					.where(eq(orderItems.id, orderItemsData.productId))
// 					.returning();

// 				response
// 					.status(201)
// 					.json(
// 						new ApiResponse(
// 							200,
// 							createOrderItems,
// 							'Products fetched successfully'
// 						)
// 					);
// 			});
// 		} catch (error) {
// 			response.status(500).json(new ApiError(500, 'Error Happens', error));
// 		}
// 	}
// );

// Delete Order
export const deleteOrder = asyncHandler(
	async (request: Request, response: Response) => {
		const orderId = request.params.orderId;
		try {
			await db.delete(order).where(eq(order.id, orderId));
			response
				.status(200)
				.json(new ApiResponse(200, order, 'Order deleted successfully'));
		} catch (error) {
			response
				.status(500)
				.json(new ApiError(500, 'Error deleting order', error));
		}
	}
);
