import crypto from 'crypto';

export const generateChecksum = (response: unknown, saltKey: string) => {
	const hash = crypto.createHash('sha256');
	hash.update(response + saltKey);
	return hash.digest('hex');
};

export const validateChecksum = (
	receivedChecksum: unknown,
	computedChecksum: string,
	saltIndex: string
) => {
	return receivedChecksum === `${computedChecksum}###${saltIndex}`;
};
