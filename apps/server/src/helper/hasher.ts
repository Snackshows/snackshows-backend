import bcrypt from 'bcryptjs';
const salt = 10;

export const passwordHashed = async (password: string) => {
	return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
	enteredPassword: string,
	hashedPassword: string
) => {
	if (
		typeof enteredPassword !== 'string' ||
		typeof hashedPassword !== 'string'
	) {
		throw new Error('Invalid arguments: Passwords must be strings');
	}
	return await bcrypt.compare(enteredPassword, hashedPassword);
};
