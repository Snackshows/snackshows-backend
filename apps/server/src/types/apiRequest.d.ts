// import { Request } from 'express';

interface AuthenticatedRequest extends Request {
	user;
}

interface PassportUser {
	id: string;
	username: string;
	email: string;
	role: string;
	refreshToken: string;
}
interface User {
	id: string;
	email: string;
	refreshToken: string;
}

// declare global {
// 	namespace Express {
// 		type User = PassportUser // Extending Express.User with Prisma User type
// 	}
// }

declare namespace Express {
	export interface Request {
		storeId?: string;
		subscription?: {
			tier: string;
			active: boolean;
			expiresAt: string;
		};
	}
}
