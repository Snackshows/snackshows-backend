// import { Request, Response } from 'express';
// import asyncHandler from '../utils/asyncHandler';
// import ApiError from '../utils/ApiError';
// import { db } from '../db';
// import { eq } from 'drizzle-orm';
// import ApiResponse from '../utils/ApiResponse';
// import { category } from '../db/schema';

// export const createCategory = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		const { name, slug, description, parentId } = request.body;

// 		console.log(request.body);

// 		try {
// 			const existedCategory = await db.query.category.findFirst({
// 				where: eq(category.name, name),
// 			});

// 			if (existedCategory) {
// 				response.status(200).json(new ApiError(409, 'Category already exists'));
// 			} else {
// 				if (parentId) {
// 					const [createdCategory] = await db
// 						.insert(category)
// 						.values({
// 							name,
// 							slug,
// 							description,
// 							parentId,
// 						})
// 						.returning();
// 					console.log('Created Category', createdCategory);
// 					response
// 						.status(200)
// 						.json(
// 							new ApiResponse(200, createdCategory, 'New Category Created')
// 						);
// 				} else {
// 					const [createdCategory] = await db
// 						.insert(category)
// 						.values({
// 							name,
// 							slug,
// 							description,
// 						})
// 						.returning();
// 					console.log('Created Category', createdCategory);
// 					response
// 						.status(200)
// 						.json(
// 							new ApiResponse(200, createdCategory, 'New Category Created')
// 						);
// 				}
// 			}
// 		} catch (error) {
// 			console.log(error);
// 			response.status(500).json(new ApiError(500, 'Error Happens', error));
// 		}
// 	}
// );

// export const getCategories = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		try {
// 			const categoryId = request.params.categoryId;
// 			if (categoryId) {
// 				const categories = await db.query.category.findFirst({
// 					where: eq(category.id, categoryId),
// 				});
// 				response
// 					.status(200)
// 					.json(new ApiResponse(200, categories, 'Category fetched'));
// 				return;
// 			} else {
// 				const categories = await db.query.category.findMany();
// 				response
// 					.status(200)
// 					.json(new ApiResponse(200, categories, 'Categories fetched'));
// 			}
// 		} catch (error) {
// 			response.status(400).json(new ApiError(400, 'Error Happened', error));
// 		}
// 	}
// );

// export const updateCategory = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		const { name, slug, description, parentId } = request.body;

// 		try {
// 			const categoryId = request.params.categoryId;
// 			const [updatedCategory] = await db
// 				.update(category)
// 				.set({
// 					name,
// 					slug,
// 					description,
// 					parentId,
// 				})
// 				.where(eq(category.id, categoryId))
// 				.returning();

// 			response
// 				.status(200)
// 				.json(new ApiResponse(200, updatedCategory, 'Category is Updated'));
// 		} catch (error) {
// 			response.status(400).json(new ApiError(400, 'Error Happened', error));
// 		}
// 	}
// );

// export const deleteCategory = asyncHandler(
// 	async (request: Request, response: Response) => {
// 		const categoryId = request.params.categoryId;

// 		try {
// 			const [deletedCategory] = await db
// 				.delete(category)
// 				.where(eq(category.id, categoryId))
// 				.returning();
// 			response
// 				.status(200)
// 				.json(new ApiResponse(200, deletedCategory, 'Category is Deleted'));
// 		} catch (error) {
// 			response.status(400).json(new ApiError(400, 'Error Happened', error));
// 		}
// 	}
// );
