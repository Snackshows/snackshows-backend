import { generateAccessToken } from '../helper/token';
import asyncHandler from '../utils/asyncHandler';

import { Request, Response } from 'express';
// import prisma from '../db/prismaClient';
import ApiResponse from '../utils/ApiResponse';
import { role } from '../db/schema';
import { db } from '../db';
import ApiError from '../utils/ApiError';

export const createRole = asyncHandler(
	async (request: Request, response: Response) => {
		try {
			const newRole = await db
				.insert(role)
				.values({
					name: request.body.name,
				})
				.returning();
			console.log(newRole);

			response
				.status(200)
				.json(new ApiResponse(200, newRole, 'Role created successfully'));
		} catch (error) {
			console.log(error);
			response.status(400).json(new ApiError(400, 'Role already exists'));
		}
	}
);

export const loginUser = asyncHandler(
	async (request: Request, response: Response) => {
		const user = request.user as User;
		const accessToken = generateAccessToken({
			id: user.id,
			email: user.email,
		});

		if (request.user) {
			// Set HTTP-only cookies
			response.cookie('access_token', accessToken, {
				// httpOnly: true,
				secure: true,
				maxAge: 15 * 60 * 1000, // 15 minutes
				sameSite: 'strict',
			});

			response.cookie('refresh_token', user.refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			response.json(
				new ApiResponse(
					200,
					{
						user: user,
						session: request.session,
						token: accessToken,
					},
					'User logged In Successfully'
				)
			);
		} else {
			response.status(500).json(new ApiError(400, 'Error Happens'));
		}
	}
);
