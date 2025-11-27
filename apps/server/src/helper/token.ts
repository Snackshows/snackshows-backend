import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const resetPasswordTokenSecretKey = process.env.FORGET_PASSWORD_JWT_SECRET!;
const emailVerifyTokenSecretKey = process.env.VERIFY_EMAIL_TOKEN_SECRET!;

export const generateAccessToken = ({
	id,
	email,
}: {
	id: number | string;
	email: string;
}) => {
	const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET!;
	const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY! as `${number}${
		| 'm'
		| 'h'
		| 'd'}`;
	if (!accessTokenSecretKey) {
		throw new Error(
			'ACCESS_TOKEN_SECRET is missing from environment variables'
		);
	}
	console.log('Access Token------->', accessTokenSecretKey);
	return jwt.sign({ id, email }, accessTokenSecretKey, {
		expiresIn: accessTokenExpiry,
	});
};

export const generateRefreshToken = (id: string | number) => {
	const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET!;
	const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY! as `${number}${
		| 'm'
		| 'h'
		| 'd'}`;

	console.log('REFRESH_TOKEN_SECRET---->', refreshTokenSecretKey);

	// if (!refreshTokenSecretKey) {
	// 	throw new Error(
	// 		'REFRESH_TOKEN_SECRET is missing from environment variables'
	// 	);
	// }
	return jwt.sign({ id }, refreshTokenSecretKey, {
		expiresIn: refreshTokenExpiry,
	});
};

export const generateResetPasswordToken = (id: string) => {
	console.log('resetPasswordTokenSecretKey', resetPasswordTokenSecretKey);
	return jwt.sign({ id }, resetPasswordTokenSecretKey, {
		expiresIn: '15m',
	});
};

export const generateEmailVerifyToken = (email: string) => {
	return jwt.sign({ email }, emailVerifyTokenSecretKey, {
		expiresIn: '60min',
	});
};

export const verifyEmailVerifyToken = (token: string) => {
	try {
		const data = jwt.verify(token, process.env.VERIFY_EMAIL_TOKEN_SECRET!);
		return data;
	} catch (error) {
		return error;
	}
};

export const verifyResetPasswordJwtToken = (token: string) => {
	// const resetPasswordTokenSecretKey = process.env.FORGET_PASSWORD_JWT_SECRET!;
	try {
		const data = jwt.verify(token, resetPasswordTokenSecretKey);
		return data;
	} catch (error) {
		return error;
	}
};

export const verifyRefreshJwtToken = (refreshToken: string) => {
	const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET!;

	if (refreshTokenSecretKey !== undefined) {
		try {
			const data = jwt.verify(refreshToken, refreshTokenSecretKey);
			return data;
		} catch (error) {
			return error;
		}
	}
};
