import { Request, Response } from 'express';
import { db } from '../db';
import { product } from '../db/schema';
import { eq } from 'drizzle-orm';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import {
	productMedia,
	productOptions,
	productOptionsValues,
	productVariant,
} from '../db/schema/product';
import redis from '../lib/redis';

// Get all products
export const getAllProducts = asyncHandler(
	async (request: Request, response: Response) => {
		// const storeId = request.query.storeId as string;
		const storeId = request.storeId!;

		if (!storeId) {
			response.status(400).json(new ApiError(400, 'storeId is required'));
		}
		try {
			const cachedProducts = await redis.get(`store:${storeId}:products`);
			console.log('cachedProducts', cachedProducts);

			if (cachedProducts) {
				response
					.status(200)
					.json(
						new ApiResponse(
							200,
							JSON.parse(cachedProducts),
							'Products fetched successfully'
						)
					);
			} else {
				const products = await db.query.product.findMany({
					where: eq(product.storeId, storeId),
					with: {
						media: {
							with: {
								media: true,
							},
							columns: {
								productId: false,
								mediaId: false,
							},
						},
						category: true,
					},
				});
				if (!products) {
					response.status(404).json(new ApiError(404, 'Products not found'));
				}

				const simplifiedProducts = products.map((product) => ({
					...product,
					category: product.category?.name ?? '',

					media: product.media.map((m) => ({
						index: m.index,
						mediaId: m.media.id,

						...m.media,
					})), // Extract only media objects
				}));

				console.log(simplifiedProducts);

				await redis.set(
					`products:${storeId}`,
					JSON.stringify(simplifiedProducts)
				);
				response
					.status(200)
					.json(
						new ApiResponse(
							200,
							simplifiedProducts,
							'Products fetched successfully'
						)
					);
			}
		} catch (error) {
			response.status(500).json(new ApiError(500, 'Error Happens', error));
		}
	}
);

// Get single product by ID
export const getProductById = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const productId = request.params.productId as string;

			db.transaction(async (trx) => {
				const productDetails = await trx.query.product.findFirst({
					where: eq(product.id, productId),
					with: {
						media: {
							with: {
								media: true,
							},
							columns: {
								productId: false,
								mediaId: false,
							},
						},
					},
				});

				if (!productDetails) {
					response.status(404).json(new ApiError(404, 'Product not found'));
				}

				const media = await trx.query.productMedia.findMany({
					where: eq(productMedia.productId, productId),
				});

				console.log(media);
				if (!productDetails) {
					response.status(404).json(new ApiError(404, 'Product not found'));
				}
				const simplifiedProduct = {
					...productDetails,
					description: productDetails?.description ?? '',
					media: productDetails?.media?.map((m) => ({
						index: m.index,
						mediaId: m.media.id,
						...m.media,
					})), // Extract only media objects
				};

				if (productDetails && productDetails.isVariantEnabled) {
					const options = await trx.query.productOptions.findMany({
						where: eq(productOptions.productId, productId),
						with: {
							values: true,
						},
					});

					const variants = await trx
						.select({
							variantId: productVariant.id,
							sku: productVariant.sku,
							barcode: productVariant.barcode,
							price: productVariant.price,
							comparedAtPrice: productVariant.comparedAtPrice,
							costPerItem: productVariant.costPerItem,
							manageInventory: productVariant.manageInventory,
							inventoryQuantity: productVariant.inventoryQuantity,
							requiresShipping: productVariant.requiresShipping,
							weight: productVariant.weight,
							weightUnit: productVariant.weightUnit,
							option1: productVariant.option1,
							option2: productVariant.option2,
							option3: productVariant.option3,
						})
						.from(productVariant)
						.where(eq(productVariant.productId, productId));

					response.status(200).json(
						new ApiResponse(
							200,
							{
								...simplifiedProduct,
								variants,
								options,
							},
							'Product fetched successfully'
						)
					);
				} else if (productDetails && !productDetails.isVariantEnabled) {
					const variant = await trx.query.productVariant.findFirst({
						where: eq(productVariant.productId, productId),
					});

					response.status(200).json(
						new ApiResponse(
							200,
							{
								...simplifiedProduct,
								variant,
							},
							'Product fetched successfully'
						)
					);
				}
			});
		} catch (error) {
			console.log(error);
			response
				.status(500)
				.json(new ApiError(500, 'Error fetching product', error));
		}
	}
);

// Create new product
export const createProduct = asyncHandler(
	async (request: Request, response: Response) => {
		const {
			storeId,
			title,
			description,
			categoryId,
			status,
			media,
			isVariantEnabled,
			variant,
			options,
			variants,
			seo,
		}: {
			storeId: string;
			title: string;
			description: string;
			categoryId: string;
			status: string;
			media: { mediaId: string; index: number }[];
			isVariantEnabled: boolean;
			variant: {
				sku: string;
				barcode: string;
				price: number;
				comparedAtPrice: number;
				costPerItem: number;
				manageInventory: boolean;
				inventoryQuantity: number;
				requiresShipping: boolean;
				weight: number;
				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
				option1: string | null;
				option2: string | null;
				option3: string | null;
			};
			options: {
				name: string;
				position: number;
				values: {
					value: string;
					position: number;
				}[];
			}[];
			variants: {
				sku: string;
				barcode: string;
				price: number;
				comparedAtPrice: number;
				costPerItem: number;
				manageInventory: boolean;
				inventoryQuantity: number;
				requiresShipping: boolean;
				weight: number;
				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
				option1: string | null;
				option2: string | null;
				option3: string | null;
			}[];
			seo: {
				title: string;
				description: string;
				keywords: string;
			};
		} = request.body;
		try {
			db.transaction(async (trx) => {
				const [productResult] = await trx
					.insert(product)
					.values({
						storeId,
						categoryId,
						title,
						description,
						status: status.toLowerCase() === 'active' ? 'active' : 'draft',
						isVariantEnabled,
						seoTitle: seo.title,
						seoDescription: seo.description,
						seoKeywords: seo.keywords,
					})
					.returning();

				const productId = productResult.id;

				if (media.length > 0) {
					await trx.insert(productMedia).values(
						media.map((media, index) => {
							return {
								index: index,
								productId,
								mediaId: media.mediaId,
							};
						})
					);
				}

				const mediaResult = await trx.query.productMedia.findMany({
					where: eq(productMedia.productId, productId),
					with: {
						media: true,
					},
					columns: {
						index: false,
						productId: false,
						mediaId: false,
					},
				});

				const mediaData = mediaResult.map((media) => ({
					id: media.media.id,
					storeId: media.media.storeId,
					fileName: media.media.fileName,
					url: media.media.url,
					key: media.media.key,
					size: media.media.size,
					createdAt: media.media.createdAt,
					lastModified: media.media.lastModified,
				}));

				if (!isVariantEnabled) {
					const variantResult = await trx
						.insert(productVariant)
						.values({
							productId: productId,
							sku: variant.sku,
							barcode: variant.barcode,
							price: variant.price,
							comparedAtPrice: variant.comparedAtPrice,
							costPerItem: variant.costPerItem,
							manageInventory: variant.manageInventory,
							inventoryQuantity: variant.inventoryQuantity,
							requiresShipping: variant.requiresShipping,
							weight: variant.weight,
							weightUnit: variant.weightUnit,
							option1: null,
							option2: null,
							option3: null,
						})
						.returning();

					response.status(201).json(
						new ApiResponse(
							200,
							{
								...productResult,
								media: mediaData,
								variant: variantResult,
							},
							'Product created successfully'
						)
					);
				} else {
					// 🔴 Insert options
					const optionsResult = await trx
						.insert(productOptions)
						.values(
							options.map((option) => {
								return {
									productId: productId,
									name: option.name,
									position: option.position,
								};
							})
						)
						.returning();

					console.log('Options Result--->', optionsResult);
					const flatOptions = optionsResult.flat();

					// 🔴 Insert option values
					await Promise.all(
						options.flatMap((option, i) => {
							const optionId = flatOptions[i].id;
							return option.values.map((value) =>
								trx.insert(productOptionsValues).values({
									optionId,
									value: value.value,
									position: value.position,
								})
							);
						})
					);

					const variantResult = await trx
						.insert(productVariant)
						.values(
							variants.map((variant) => ({
								productId: productId,
								sku: variant.sku,
								barcode: variant.barcode,
								price: variant.price,
								costPerItem: variant.costPerItem,
								comparedAtPrice: variant.comparedAtPrice,
								manageInventory: variant.manageInventory,
								inventoryQuantity: variant.inventoryQuantity,
								requiresShipping: variant.requiresShipping,
								weight: variant.weight,
								weightUnit: variant.weightUnit,
								option1: variant.option1 ? variant.option1 : null,
								option2: variant.option2 ? variant.option2 : null,
								option3: variant.option3 ? variant.option3 : null,
							}))
						)
						.returning();
					response.status(201).json(
						new ApiResponse(
							200,
							{
								...productResult,
								media: mediaData,
								variant: variantResult,
								options: optionsResult,
							},
							'Product created successfully'
						)
					);
				}
			});
		} catch (error) {
			response
				.status(400)
				.json(new ApiError(400, 'Error creating product', error));
		}
	}
);

// Update product
export const updateProduct = asyncHandler(
	async (request: Request, response: Response) => {
		const {
			storeId,
			title,
			description,
			categoryId,
			status,
			media,
			isVariantEnabled,
			variant,
			options,
			variants,
			seo,
		}: {
			storeId: string;
			title: string;
			description: string;
			categoryId: string;
			status: string;
			media: { mediaId: string; index: number }[];
			isVariantEnabled: boolean;
			variant: {
				variantId: number;
				sku: string;
				barcode: string;
				price: number;
				comparedAtPrice: number;
				costPerItem: number;
				manageInventory: boolean;
				inventoryQuantity: number;
				requiresShipping: boolean;
				weight: number;
				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
				option1: string | null;
				option2: string | null;
				option3: string | null;
			};
			options: {
				name: string;
				position: number;
				values: {
					value: string;
					position: number;
				}[];
			}[];
			variants: {
				variantId: number;
				sku: string;
				barcode: string;
				price: number;
				comparedAtPrice: number;
				costPerItem: number;
				manageInventory: boolean;
				inventoryQuantity: number;
				requiresShipping: boolean;
				weight: number;
				weightUnit: 'kg' | 'g' | 'oz' | 'lb';
				option1: string | null;
				option2: string | null;
				option3: string | null;
			}[];
			seo: {
				title: string;
				description: string;
				keywords: string;
			};
		} = request.body;
		try {
			const productId = request.params.productId as string;
			console.log('productId', productId, media);

			console.log('Body---->', request.body);

			// Validate required fields
			if (!title) {
				response.status(400).json({ message: 'Title is required' });
			}

			await db.transaction(async (trx) => {
				const [productResult] = await trx
					.update(product)
					.set({
						storeId,
						categoryId,
						title: title.trim(), // Trim whitespace from title
						description,
						status: status?.toLowerCase() === 'active' ? 'active' : 'draft',
						isVariantEnabled,
						seoTitle: seo?.title,
						seoDescription: seo?.description,
						seoKeywords: seo?.keywords,
					})
					.where(eq(product.id, productId))
					.returning();

				if (!productResult) {
					response.status(404).json({ message: 'Product not found' });
				}

				///Update the media
				await trx
					.delete(productMedia)
					.where(eq(productMedia.productId, productId));

				for (const { index, mediaId } of media) {
					await trx
						.insert(productMedia)
						.values({ index, mediaId, productId })
						.returning()
						.then((result) => {
							console.log('mediaId===>', result);
							// mediaData.push(...result);
						});
				}

				if (!isVariantEnabled && !options.length && !variants.length) {
					await trx
						.delete(productVariant)
						.where(eq(productVariant.productId, productId));

					const options = await trx.query.productOptions.findMany({
						where: eq(productOptions.productId, productId),
					});

					await Promise.all(
						options.map((option) =>
							trx
								.delete(productOptionsValues)
								.where(eq(productOptionsValues.optionId, option.id))
						)
					);
					await trx
						.delete(productOptions)
						.where(eq(productOptions.productId, productId));

					const variantResult = await trx
						.insert(productVariant)
						.values({
							productId: productId,
							sku: variant.sku,
							barcode: variant.barcode,
							price: variant.price,
							comparedAtPrice: variant.comparedAtPrice,
							costPerItem: variant.costPerItem,
							manageInventory: variant.manageInventory,
							inventoryQuantity: variant.inventoryQuantity,
							requiresShipping: variant.requiresShipping,
							weight: variant.weight,
							weightUnit: variant.weightUnit,
							option1: null,
							option2: null,
							option3: null,
						})
						.returning();

					response.status(201).json(
						new ApiResponse(
							200,
							{
								...productResult,

								variant: variantResult,
							},
							'Product created successfully'
						)
					);
				}

				if (isVariantEnabled && options.length && variants.length) {
					await trx
						.delete(productVariant)
						.where(eq(productVariant.productId, productId));

					const deleteOptions = await trx.query.productOptions.findMany({
						where: eq(productOptions.productId, productId),
					});

					await Promise.all(
						deleteOptions.map((option) =>
							trx
								.delete(productOptionsValues)
								.where(eq(productOptionsValues.optionId, option.id))
						)
					);
					await trx
						.delete(productOptions)
						.where(eq(productOptions.productId, productId));
					// 🔴 Update multi Variant
					const optionsResult = await trx
						.insert(productOptions)
						.values(
							options.map((option) => {
								return {
									productId: productId,
									name: option.name,
									position: option.position,
								};
							})
						)
						.returning();

					console.log('Options Result--->', optionsResult);
					const flatOptions = optionsResult.flat();

					// 🔴 Insert option values
					await Promise.all(
						options.flatMap((option, i) => {
							const optionId = flatOptions[i].id;
							return option.values.map((value) =>
								trx.insert(productOptionsValues).values({
									optionId,
									value: value.value,
									position: value.position,
								})
							);
						})
					);

					const variantResult = await trx
						.insert(productVariant)
						.values(
							variants.map((variant) => ({
								productId: productId,
								sku: variant.sku,
								barcode: variant.barcode,
								price: variant.price,
								costPerItem: variant.costPerItem,
								comparedAtPrice: variant.comparedAtPrice,
								manageInventory: variant.manageInventory,
								inventoryQuantity: variant.inventoryQuantity,
								requiresShipping: variant.requiresShipping,
								weight: variant.weight,
								weightUnit: variant.weightUnit,
								option1: variant.option1 ? variant.option1 : null,
								option2: variant.option2 ? variant.option2 : null,
								option3: variant.option3 ? variant.option3 : null,
							}))
						)
						.returning();
					response.status(201).json(
						new ApiResponse(
							200,
							{
								...productResult,

								variant: variantResult,
								options: optionsResult,
							},
							'Product created successfully'
						)
					);
				}

				// console.log('mediaData===>', mediaData);
			});
		} catch (error) {
			console.log(error);
			response.status(400).json({ message: 'Error updating product', error });
		}
	}
);

// Delete product
export const deleteProduct = asyncHandler(
	async (req: Request, res: Response) => {
		try {
			const productId = req.params.productId as string;

			db.transaction(async (trx) => {
				await trx
					.delete(productMedia)
					.where(eq(productMedia.productId, productId));

				const options = await trx.query.productOptions.findMany({
					where: eq(productOptions.productId, productId),
				});

				await Promise.all(
					options.map((option) =>
						trx
							.delete(productOptionsValues)
							.where(eq(productOptionsValues.optionId, option.id))
					)
				);
				await trx
					.delete(productOptions)
					.where(eq(productOptions.productId, productId));

				await trx
					.delete(productVariant)
					.where(eq(productVariant.productId, productId));

				const [result] = await trx
					.delete(product)
					.where(eq(product.id, productId))
					.returning();

				if (!result) {
					res.status(404).json(new ApiError(404, 'Product not found'));
				}
				res
					.status(200)
					.json(
						new ApiResponse(200, { result }, 'Product deleted successfully')
					);
			});
		} catch (error) {
			console.log(error);
			res.status(500).json(new ApiError(500, 'Error deleting product', error));
		}
	}
);
