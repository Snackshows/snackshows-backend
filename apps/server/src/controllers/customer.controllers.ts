import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { db } from '../db';
import { eq, InferSelectModel, and, ne } from 'drizzle-orm';
import ApiResponse from '../utils/ApiResponse';
import { passwordHashed } from '../helper/hasher';
import { customer, customerStore, user } from '../db/schema';
import {
	generateResetPasswordToken,
	verifyResetPasswordJwtToken,
} from '../helper/token';
import { customerAddress } from '../db/schema/customer';

//Account Routes
export const registerCustomer = asyncHandler(
	async (request: Request, response: Response) => {
		const { firstName, lastName, email, password } = request.body;

		const storeId = request.storeId!;

		console.log(request.body);

		try {
			const existedUser = await db.query.customer.findFirst({
				where: eq(customer.email, email),
			});
			if (existedUser) {
				response.status(200).json(new ApiError(409, 'User already exists'));
			} else {
				const hashedPassword = await passwordHashed(password);
				const createdCustomer = await db
					.insert(customer)
					.values({
						firstName,
						lastName,
						email,
						password: hashedPassword,
					})
					.returning();
				console.log('Existed Not User', createdCustomer);

				const registerStore = await db.insert(customerStore).values({
					customerId: createdCustomer[0].id,
					storeId: storeId,
				});

				console.log('Register Store', registerStore);
				console.log('Register User', createdCustomer);
				response
					.status(200)
					.json(new ApiResponse(200, createdCustomer[0], 'New User Created'));
			}
		} catch (error) {
			console.log(error);
			response.status(500).json(new ApiError(500, 'Error Happens', error));
		}
	}
);

export const customerProfile = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof customer>;

		try {
			const userprofile = await db.query.customer.findFirst({
				where: eq(customer.id, authUser.id),
				columns: {
					password: false,
					refreshToken: false,
				},
			});

			response
				.status(200)
				.json(new ApiResponse(200, userprofile, 'Fetch User Details'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const updateCustomerProfile = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof user>;

		const { firstName, lastName, email, password, avatar, gender, age, phone } =
			request.body;

		try {
			const userProfile = await db
				.update(user)
				.set({
					firstName,
					lastName,
					email,
					password,
					avatar,
					gender,
					age,
					phone,
				})
				.where(eq(user.id, authUser.id))
				.returning();

			response
				.status(200)
				.json(new ApiResponse(200, userProfile[0], 'Profile is Updated'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const deleteCustomerProfile = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof user>;

		try {
			await db.delete(user).where(eq(user.id, authUser.id));
			response
				.status(200)
				.json(new ApiResponse(200, user, 'Profile is Updated'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

//Address Routes
export const createCustomerAddress = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof customer>;

		const {
			firstName,
			lastName,
			company,
			address1,
			address2,
			city,
			province,
			provinceCode,
			country,
			countryCode,
			zipcode,
			phone,
			isDefault,
		} = request.body;

		try {
			const address = await db
				.insert(customerAddress)
				.values({
					customerId: authUser.id,
					firstName,
					lastName,
					company,
					address1,
					address2,
					city,
					province,
					provinceCode,
					country,
					countryCode,
					zipcode,
					phone,
					isDefault,
				})
				.returning();

			response
				.status(200)
				.json(new ApiResponse(200, address[0], 'Address is Created'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const getCustomerAddresses = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof customer>;

		const addressId = request.params.addressId;

		try {
			if (addressId) {
				const address = await db.query.customerAddress.findFirst({
					where: eq(customerAddress.id, addressId),
				});

				if (!address) {
					response
						.status(404)
						.json(new ApiError(404, 'Address is not Existed'));
				}
				response.json(new ApiResponse(200, address, 'Address Details fetched'));
			} else {
				const addresses = await db.query.customerAddress.findMany({
					where: eq(customerAddress.customerId, authUser.id),
				});

				response.json(new ApiResponse(200, addresses, 'All Addresses fetched'));
			}
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const updateCustomerAddress = asyncHandler(
	async (request: Request, response: Response) => {
		const addressId = request.params.addressId;

		const {
			firstName,
			lastName,
			company,
			address1,
			address2,
			city,
			province,
			provinceCode,
			country,
			countryCode,
			zipcode,
			phone,
		} = request.body;

		try {
			const address = await db.query.customerAddress.findFirst({
				where: eq(customerAddress.id, addressId),
			});

			if (!address) {
				response.status(404).json(new ApiError(404, 'Address is not Existed'));
			}

			const [updatedAddress] = await db
				.update(customerAddress)
				.set({
					firstName,
					lastName,
					company,
					address1,
					address2,
					city,
					province,
					provinceCode,
					country,
					countryCode,
					zipcode,
					phone,
				})
				.where(eq(customerAddress.id, addressId))
				.returning();

			response.json(
				new ApiResponse(200, updatedAddress, 'Address Details is Updated')
			);
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

export const updateCustomerDefaultAddress = asyncHandler(
	async (request: Request, response: Response) => {
		const addressId = request.params.addressId;

		try {
			// Find the address to be set as default
			const address = await db.query.customerAddress.findFirst({
				where: eq(customerAddress.id, addressId),
			});

			if (!address) {
				response.status(404).json(new ApiError(404, 'Address is not Existed'));
			}

			// Start a transaction to ensure data consistency
			await db.transaction(async (tx) => {
				// Find and update the current default address (if any) to set isDefault to false
				const currentDefault = await tx.query.customerAddress.findFirst({
					where: and(
						// eq(customerAddress.customerId, address.customerId),
						eq(customerAddress.isDefault, true),
						ne(customerAddress.id, addressId) // Exclude the address we're about to update
					),
				});

				if (currentDefault) {
					await tx
						.update(customerAddress)
						.set({ isDefault: false })
						.where(eq(customerAddress.id, currentDefault.id));
				}

				// Set the new default address
				const [updatedAddress] = await tx
					.update(customerAddress)
					.set({ isDefault: true })
					.where(eq(customerAddress.id, addressId))
					.returning();

				response.json(
					new ApiResponse(
						200,
						updatedAddress,
						'Default address updated successfully'
					)
				);
			});
		} catch (error) {
			if (error instanceof ApiError) {
				response.status(error.statusCode).json(error);
			} else {
				response
					.status(500)
					.json(new ApiError(500, 'Failed to update default address', error));
			}
		}
	}
);

export const deleteCustomerAddress = asyncHandler(
	async (request: Request, response: Response) => {
		const addressId = request.params.addressId;

		try {
			const [deletedAddress] = await db
				.delete(customerAddress)
				.where(eq(customerAddress.id, addressId))
				.returning();

			if (!deletedAddress) {
				response.status(404).json(new ApiError(404, 'Address is not Existed'));
			}

			response.json(new ApiResponse(200, deletedAddress, 'Address is Deleted'));
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

// Users settings
export const getCustomerSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof user>;

		try {
			const userSettings = await db.query.user.findFirst({
				where: eq(user.id, authUser.id),
			});

			response.json(
				new ApiResponse(200, userSettings, 'User Account Settings fetched')
			);
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);
export const updateCustomerSettings = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof user>;

		const { email, password, avatar, gender, age, phone } = request.body;

		try {
			const userSettings = await db
				.update(user)
				.set({
					email,
					password,
					avatar,
					gender,
					age,
					phone,
				})
				.where(eq(user.id, authUser.id))
				.returning();

			response.json(
				new ApiResponse(200, userSettings[0], 'Update User Settings')
			);
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

// Users notifications
export const getCustomerNotification = asyncHandler(
	async (request: Request, response: Response) => {
		const authUser = request.user as InferSelectModel<typeof user>;

		const { email, password, avatar, gender, age, phone } = request.body;

		try {
			const userSettings = await db
				.update(user)
				.set({
					email,
					password,
					avatar,
					gender,
					age,
					phone,
				})
				.where(eq(user.id, authUser.id))
				.returning();

			response.json(
				new ApiResponse(200, userSettings[0], 'Update User Settings')
			);
		} catch (error) {
			response.status(400).json(new ApiError(400, 'Error Happened', error));
		}
	}
);

// //Forget Password
export const forgetPassword = asyncHandler(
	async (request: Request, response: Response) => {
		const { email } = request.body;

		if (!email) {
			response.status(400).json({ error: 'Please Enter field' });
		}

		try {
			const userProfile = await db.query.user.findFirst({
				where: eq(user.email, email),
			});

			if (!userProfile) {
				response.status(400).json({ error: 'Email is not registered' });
			} else {
				// console.log("User Profile", userProfile);
				const token = generateResetPasswordToken(userProfile.id);
				console.log('Token', token);

				// const emailInfo = await forgotPasswordEmail({
				// 	receiverEmail: email,
				// 	userFirstName: userProfile.firstName,
				// 	token,
				// });

				response
					.status(200)
					.json(new ApiResponse(200, {}, 'New Password Updated'));
			}
		} catch (error) {
			response.status(400).json(new ApiError(400, 'error Happens', error));
		}
	}
);

// //Reset Password Link
export const resetLink = asyncHandler(
	async (request: Request, response: Response) => {
		const { token, confirmPassword, newPassword } = request.body;

		if (confirmPassword !== newPassword && !token) {
			response.status(400).json({
				error: 'Confirm and New password is not matched or token is getting.',
			});
		}

		if (typeof newPassword === 'string') {
			const { id } = (await verifyResetPasswordJwtToken(token)) as {
				id: string;
			};

			try {
				const userProfile = await db
					.update(customer)
					.set({
						password: await passwordHashed(newPassword),
					})
					.where(eq(customer.id, id))
					.returning();

				response
					.status(200)
					.json(new ApiResponse(200, userProfile[0], 'New Password Updated'));
			} catch (error) {
				console.log(error);
				response
					.status(400)
					.json(new ApiError(400, 'Password not Updated', error));
			}
		} else {
			response
				.status(400)
				.json(new ApiError(400, 'Please give only string value'));
		}
	}
);

//Logout
export const logoutCustomer = asyncHandler(
	async (request: Request, response: Response) => {
		request.logout(async (err) => {
			if (err) {
				response.status(500).json({ message: 'Logout failed' });
			}

			const token = request.cookies.refresh_token;

			console.log('Logout, Refresh Token--->', token);
			try {
				await db
					.update(customer)
					.set({ refreshToken: null })
					.where(eq(customer.refreshToken, token));

				response.clearCookie('access_token', {
					// httpOnly: true,
					secure: process.env.NODE_ENV === 'production', // Secure in production
					sameSite: 'strict',
					path: '/',
				});
				response.clearCookie('refresh_token', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production', // Secure in production
					sameSite: 'strict',
					path: '/',
				});
				response.status(200).json({ message: 'Logged out successfully' });
			} catch {
				response.status(500).json({ error: 'Server error' });
			}
		});
	}
);
